/**
 * 添加一个聚合图层
 * @param map 初始化的map
 * @param object {
 *                 url:'',//图层url
 *                 layers:''//图层名称
 *                 featureNS:''//图层空间标识符
 *                 featurePrefix:''//图层命名空间
 *                 epsg:4326//图层空间坐标系
 *                }
 *
 */
import Draw from "../interaction/Draw";
import {extend, hasUndefined, isUndefined} from "../../../common/util";
import {DefaultOptions} from "../../../map/TsMapConstants";
import Styles from "../style/Styles";
import SourceVector from "../common/SourceVector";
import Measure from "../tool/Measure";
import GraphicLayer from "./GraphicLayer";

class ClusterLayer {

  constructor(map, options) {
    options = options ? options : {};
    this._id = options.id;
    this.map = map;
    this.options = extend(this.getDefaultOptions(), options);

    if (hasUndefined(this.map)) {
      return;
    }

    this.draw = null;//用于空间过滤绘制图形
    if (this.options.coordinate) {
      let geom = new ol.geom.Polygon([this.options.coordinate]);
      let feature = new ol.Feature(geom);
      this.feature = feature.getGeometry();
    } else {
      this.feature = null;
    }
    this.filters = null;

    let _this = this;
    this.queryCallBack = null;

    //如果是wfs图层wfs为 true
    this.wfs = true;
    if (this.options.url) {
      this.wfs = true;
      this.vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        loader: function (extent, resolution, projection) {  //加载函数
          let proj = projection.getCode();
          let url = _this.options.url + '&version=1.0.0&request=GetFeature&typename=' + _this.options.featurePrefix + ':' + _this.options.layer
            + '&outputFormat=application/json&srsname=' + proj + '&' + 'bbox=' + extent.join(',') + ',' + proj;

          if (_this.feature || _this.filters) {
            let filter = null;

            if (_this.feature) {
              let ty = _this.feature.getType();

              if (ty === "Polygon") {
                filter = new ol.format.filter.Intersects(_this.options.geom, _this.feature);//相交查询
              } else {
                _this.feature = null;
              }
            }

            if (_this.filters) {
              filter = _this.filters;
            }

            if (_this.feature && _this.filters) {
              filter = ol.format.filter.and(
                ol.format.filter.intersects(_this.options.geom, _this.feature),
                _this.filters
              );
            }

            fetch(url, {
              method: 'POST',
              body: new XMLSerializer().serializeToString(new ol.format.WFS().writeGetFeature({
                srsName: 'EPSG:' + _this.options.projection,//坐标系
                featureNS: _this.options.featureNS,// 注意这个值必须为创建工作区时的命名空间URI
                featurePrefix: _this.options.featurePrefix,//工作区的命名
                featureTypes: [_this.options.layer],//所要访问的图层
                maxFeatures: 5000,
                outputFormat: 'application/json',
                //filter: new ol.format.filter.Intersects(geom, this.feature)
                filter: filter
              }))
            }).then(function (response) {
              return response.json();
            }).then(function (json) {
              let features = new ol.format.GeoJSON().readFeatures(json);

              if (features.length > 0) {
                if (_this.queryCallBack) {
                  _this.queryCallBack(json);
                }
                //console.log(features.length)
                _this.vectorSource.clear();
                _this.vectorSource.addFeatures(features);
              } else {
                console.log("没有返回要素");
              }
            });
          } else {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);

            let onError = function () {
              _this.vectorSource.removeLoadedExtent(extent);
            };

            xhr.onerror = onError;
            xhr.onload = function () {
              if (xhr.status == 200) {
                _this.vectorSource.addFeatures(_this.vectorSource.getFormat().readFeatures(xhr.responseText));
              } else {
                onError();
              }
            };

            xhr.send();
          }
        },
        strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
          maxZoom: this.options.maxZoom
        })),
        projection: 'EPSG:' + this.options.projection
      });
      this.clusterSource = new ol.source.Cluster({
        distance: parseInt(this.options.clusterDistance, 10),
        source: this.vectorSource,
      });
    } else {
      this.wfs = false;
      if (options.source) {
        this.vectorSource = options.source;

      } else {
        this.vectorSource = new SourceVector(this.map);
      }
      this.clusterSource = new ol.source.Cluster({
        distance: parseInt(this.options.clusterDistance, 10),
        source: this.vectorSource.sourceVector
      });
    }
    this.styles = new Styles();
    this.styleCache = {};
    let destyle1 = {
      radius: 10,
      color: '#ffffff',
      width: 1.25,
      fill: '#cc355f',
    };
    let destyle2 = {
      radius: 10,
      color: '#ffffff',
      width: 1.25,
      fill: '#3399CC',
    }
    this.style1 = destyle1;
    this.style2 = destyle2;
    this.vectorLayer = new ol.layer.Vector({
      source: this.clusterSource,
      style: function (feature) {
        let size = feature.get('features').length;
        var feat = feature.get('features')[0];
        feature.set("gid", feat.get("gid"));
        let style = _this.styleCache[size];
        if (size === 1 && !style) {
          style = _this.styles.getStyles(_this.style1);
          _this.styleCache[size] = style;
        } else if (!style) {
          _this.style2.text = size;
          style = _this.styles.getStyles(_this.style2);
          _this.styleCache[size] = style;

        }

        return style;
      },
    });
    this.oluid = this.vectorLayer.ol_uid;

    this.map.addLayer(this.vectorLayer);
    let zindex = map.getLayers().getLength();
    this.vectorLayer.setZIndex(zindex);
    this.radius = 100;
  }

  getDefaultOptions() {
    return {
      geom: DefaultOptions.GEOM,
      projection: DefaultOptions.PROJECTION,
      clusterDistance: 50
    };
  }

  clear() {
    if (this.wfs) {
      this.vectorSource.clear();
      this.vectorSource.refresh();
    } else {
      this.vectorSource.clear();
    }

  }

  /**
   *
   * @param object
   * @returns {null}
   */
  addFeature(object) {
    //this.clusterSource.resolution = undefined;
    //this.vectorLayer.source = undefined;
    return this.vectorSource.addFeature(object, this);

  };

  /**
   * 数组对象c
   */
  addFeatures(object) {
    //this.clusterSource.resolution = undefined;

    this.vectorSource.addFeatures(object, this);
  }

  /**
   * 空间查询
   * @param object {type:'Circle'//'Circle' 'Polygon' 'Box'}
   */
  spatialQuery(object) {
    let type = null;
    if (object) {
      type = object;
    }
    let value = null;
    switch (type) {
      case 'Circle':
        value = 'Circle';
        break;
      case 'Polygon':
        value = 'Polygon';
        break;
      case 'Box':
        value = 'Box';
        break;
      case 'RadiusCircle':
        value = 'RadiusCircle';
        break;
    }

    if (value) {
      if (isUndefined(this.draw)) {
        this.draw = new Draw(this.map);
        let _this = this;
        this.draw.setDrawEndCallback(function (e) {
          if (e) {
            let type = e.getGeometry().getType();
            if (type === 'Polygon') {
              let coord = e.getGeometry().getCoordinates();
              if (coord.length > 0) {
                if (_this.spatialQueryCallback)
                  _this.spatialQueryCallback(coord[0], e);//返回到外部的空间查询的图形
                _this.spatialQueryFromPolygon({coordinate: coord[0]});

              }
            }
          }
          _this.draw.removeInteraction();
        });//设置绘制结束的回调函数
      }
      if (this.radius) {
        this.draw.radius = this.radius;//设置半径
      } else {
        this.draw.radius = 100;//设置半径
      }
      this.draw.clearFeature();//清空绘制的图形
      this.draw.drawGraphic(value);//设置绘制的图形
    } else {
      if (this.draw) {
        this.draw.clearFeature();
      }
      this.feature = null;
      if (this.wfs) {
        this.vectorSource.clear();
        this.vectorSource.refresh();
      } else {
        this.vectorSource.spatialQueryFromPolygon(object)
      }
    }
  };

  /**
   * 空间过滤的回调函数设置，用于在多个wms图层在同一个空间过滤时使用，
   * 在样只需要在一个图层绘图就能获取的空间过滤的图形，回调函数会返回一个坐标数组
   * @param fun
   */
  setSpatialQueryCallback(callback) {
    this.spatialQueryCallback = callback;
  };

  /**
   * 通过坐标进行空间查询的
   * @param object {coordinate:[[经度,纬度]]//长度大于等于3}
   */
  spatialQueryFromPolygon(object) {
    if (this.wfs) {
      if (object.coordinate.length > 3) {
        let geom = new ol.geom.Polygon([object.coordinate]);
        let feature = new ol.Feature(geom);
        this.feature = feature.getGeometry();
        this.clear();
      }
    } else {
      return this.vectorSource.spatialQueryFromPolygon(object);
    }

  };

  /**
   * 清除绘制的图形
   */
  clearDraw() {
    if (this.draw) {
      this.draw.clearFeature();
    }
  };

  /**
   * 设置图层的可见性
   *
   * @param visible true/false
   */
  setVisible(visible) {
    this.vectorLayer.setVisible(visible);
  };

  getVisible() {
    return this.vectorLayer.getVisible();
  };

  /**
   * 设置图层的样式
   * @param style openlayer的样式对象
   */
  setStyle(style) {
    /*this.anchor = null;//图片锚点位置
   this.url = null;//图片url
   this.fill = null;//填充颜色
   this.width = null;//线宽
   this.radius = null;//圆半径
   this.color = null;//线颜色
   this.scale = 1;//图片缩放比例
   this.rotation = 0;//图片旋转角度，顺时针方向*/

    if (style) {
      if (style.distance && this.vectorLayer) {
        this.vectorLayer._distance = style.distance;
      }
    } else {
      if (this.vectorLayer)
        this.vectorLayer._distance = null;

    }
  };

  /**
   * 通过id获取要素
   * @param id
   * @returns {*}
   */
  getFeatureById(id) {
    return this.vectorSource.getFeatureById(id);
  }

  length() {
    return this.vectorSource.getFeatures().length;
  }

  /**
   * 移除图层
   */
  removeLayer() {
    this.clusterSource.source = undefined;
    this.map.removeLayer(this.vectorLayer);

  };

  /**
   * 添加到地图中
   */
  addLayer() {
    if (this.vectorLayer) {
      this.map.removeLayer(this.vectorLayer);

      this.map.addLayer(this.vectorLayer);
      let zindex = map.getLayers().getLength();
      this.vectorLayer.setZIndex(zindex);
    }
  };

  /**
   * 设置聚合的距离
   * @param object{distance:10}
   */
  setDistance(object) {
    this.clusterSource.setDistance(parseInt(object.distance, 10));
  };

  /**
   * 更新图形，用于更新半径圆，重新设置半径后更新已经绘制的半径圆
   */
  updateRadius() {
    if (this.draw) {
      if (this.radius) {
        this.draw.radius = this.radius;//设置半径
      } else {
        this.draw.radius = 100;//设置半径
      }
      this.draw.updateFeature();
    }

  };

  setStyle(object) {
    this.styleCache = {};//清空颜色缓存
    this.style1 = {
      url: object.url,
      scale: object.scale,
      fill: object.fill,
      width: object.width,
      anchor: object.anchor,
      color: object.color,
      radius: object.radius,
    };
    this.style2 = {
      url: object.url,
      scale: object.scale,
      fill: object.fill,
      width: object.width,
      anchor: object.anchor,
      color: object.color,
      radius: object.radius,
    };
    this.styles.setText(object.text ? object.text : {});
    if (object && object.style) {
      if (!Array.isArray(object.style)) {
        this.style1 = object.style;
        this.style2 = object.style;
      } else {
        if (object.style.length === 2) {
          this.style1 = object.style[0];
          this.style2 = object.style[1];
        } else {
          this.style1 = object.style[0];
          this.style2 = object.style[1];
        }
      }
    }
  }

  /**
   * 添加单击圆
   */
  onClusterCrop() {
    if (!this.measures) {
      this.measures = new Measure(this.map);
      this.gl = new GraphicLayer(this.map);
    }
    let _this = this;
    this.singleclick = this.map.on('singleclick', function (e) {
      _this.gl.clear();
      let pixel = _this.map.getEventPixel(e.originalEvent);
      let feature = _this.map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
      if (feature) {
        for (let i = 0; i < _this.clusterSource.features.length; i++) {
          let item = _this.clusterSource.features[i];
          if (feature.ol_uid === item.ol_uid) {

            var opt_extent = [];
            const mapDistance = _this.clusterSource.distance * _this.clusterSource.resolution / 2;
            opt_extent[0] = feature.getGeometry().flatCoordinates[0] + mapDistance;
            opt_extent[1] = feature.getGeometry().flatCoordinates[1] + mapDistance;
            let l = _this.measures.getXYLength({coordinate: [feature.getGeometry().flatCoordinates, opt_extent]});
            //指定半径的圆
            let graphic = {
              "geometry": {
                "type": "RadiusCircle",
                "coordinates": [
                  feature.getGeometry().flatCoordinates[0],
                  feature.getGeometry().flatCoordinates[1]
                ],
                radius: l//半径，默认是100
              }
            };
            _this.gl.addFeature(graphic);
            break;
          }
        }
      }
    });
  }

  /**
   * 移除单击圆功能
   */
  unClusterCrop() {
    this.map.un(this.singleclick.type, this.singleclick.listener);
    this.singleclick = null;
  }

  setZIndex(index) {

  }
  contains(feature) {
    return this.vectorSource.hasFeature(feature);
  }
  removeClick() {
    if (this._removefun) {
      this._removefun();
      this._removefun = null;
      this._clickCallback = null;
    }
  }

  /**
   * 图层的单击事件注册
   * @param fun 函数/null 传函数是注册事件，null是移除单击事件
   */
  setClickCallback(fun) {
    this.removeClick();
    if (fun) {
      //this._removefun = this.map._event.addEventListener(fun, this);
      this._clickCallback = fun;
    }
  }

  moveClick() {
    if (this._removefun1) {
      this._removefun1();
      this._removefun1 = null;
      this._clickCallback1 = null;
    }
  }

  setMoveCallback(fun) {
    this.moveClick();

    if (fun) {
      this._removefun1 = this.map._eventMove.addEventListener(fun, this);
      this._clickCallback1 = fun;
    }
  }

  setCluser() {
    var cs = this.clusterSource.getSource();
    cs.set('cluster', false); // 关闭聚合设置在矢量源上
  }

}

export default ClusterLayer;
