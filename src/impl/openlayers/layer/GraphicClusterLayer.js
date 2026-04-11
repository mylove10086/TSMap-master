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

class GraphicClusterLayer {

  constructor(map, object) {
    this.map = map;

    if (hasUndefined(this.map)) {
      return;
    }
    this.draw = null;//用于空间过滤绘制图形
    let _this = this;
    this.styles = new Styles();
    this.styleCache = {};
    this.style1 = {
      radius: 10,
      color: '#ffffff',
      width: 1.25,
      fill: '#cc355f',
    };
    this.style2 = {
      radius: 10,
      color: '#ffffff',
      width: 1.25,
      fill: '#3399CC',
    };
    //this.vectorSource = new ol.source.Vector();
    this.vectorSource = new SourceVector(this.map);
    this.clusterSource = new ol.source.Cluster({
      distance: 20,
      source: this.vectorSource.sourceVector
    });
    this.vectorLayer = new ol.layer.Vector({
      source: this.clusterSource,
      style: function (feature) {
        let size = feature.get('features').length;
        let style = _this.styleCache[size];
        if (size === 1 && !style) {
          style = _this.styles.getStyle(_this.style1);
          _this.styleCache[size] = style;
        } else if (!style) {
          _this.style2.text = size;
          style = _this.styles.getStyle(_this.style2);
          _this.styleCache[size] = style;
        }

        return style;
      },
    });

    this.map.addLayer(this.vectorLayer);
    let zindex = map.getLayers().getLength();
    this.vectorLayer.setZIndex(zindex);
    this.radius = 100;
  }

  clear() {
    this.vectorSource.clear();
  }

  /**
   *
   * @param object
   * @returns {null}
   */
  addFeature(object) {
    return this.vectorSource.addFeature(object);
    /*let geometry = object.geometry ? object.geometry : null,
      coords = geometry ? geometry.coordinates : null;
    if (!coords && !geometry) {
      return null;
    }
    let attr = null;
    if (object && object.properties) {
      attr = object.properties;
    }
    let type = geometry.type;
    let g = null;
    switch (type) {
      case 'Point':
        let p = new ol.geom.Point(coords);
        g = new ol.Feature({
          geometry: p
        });
        break;
    }
    if (g) {
      for (var int in attr) {
        g.set(int, attr[int]);
      }
      //this.coordinates = g.getGeometry().getCoordinates();
      this.vectorSource.addFeature(g);
    }
    return g;*/
  };

  /**
   * 数组对象c
   */
  addFeatures(object) {
    this.vectorSource.addFeatures(object);

    /*let features = [];
    for (let i = 0; i < object.length; i++) {
      let item = object[i];
      let geometry = item.geometry;

      let attr = null;
      if (object && item.properties) {
        attr = item.properties;
      }
      let type = geometry.type;
      let g = null;
      switch (type) {
        case 'Point':
          let p = new ol.geom.Point(geometry.coordinates);
          g = new ol.Feature({
            geometry: p
          });
          break;
      }
      if (g) {
        for (var int in attr) {
          g.set(int, attr[int]);
        }
        features.push(g);
      }

    }
    this.vectorSource.addFeatures(features);*/

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
            _this.feature = e.getGeometry();
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
      this.spatialQueryFromPolygon();
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
    return this.vectorSource.spatialQueryFromPolygon(object);
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
  }

  getVisible() {
    return this.vectorLayer.getVisible();
  };

  /**
   * 移除图层
   */
  removeLayer() {
    this.removeClick();
    this.moveClick();

    this.map.removeLayer(this.vectorLayer);
  };

  /**
   * 添加到地图中
   */
  addLayer() {
    if (this.vectorLayer) {
      this.map.addLayer(this.vectorLayer);
    }
  };

  /**
   * 设置聚合的距离
   * @param object{distance:10}
   */
  setDistance(object) {
    this.clusterSource.setDistance(parseInt(object.distance, 20));
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
      if (object && object.text) {
        if (object.text.color) {
          this.styles.text.color = object.text.color;
        }
        if (object.text.scale) {
          this.styles.text.scale = object.text.scale;
        }
        if (object.text.offsetX) {
          this.styles.text.offsetX = object.text.offsetX;
        }
        if (object.text.offsetY) {
          this.styles.text.offsetY = object.text.offsetY;
        }
      }

    }
    if (object) {
      if (object.distance && this.vectorLayer) {
        this.vectorLayer._distance = object.distance;
      }
    } else {
      if (this.vectorLayer) {
        this.vectorLayer._distance = null;
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

  removeClick() {
    if (this._removefun) {
      this._removefun();
      this._removefun = null;
      this._clickCallback = null;
    }
  }

  setClickCallback(fun) {
    this.removeClick();

    if (fun) {
      this._removefun = this.map._event.addEventListener(fun, this);
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

  contains(feature) {
    return this.vectorSource.hasFeature(feature);
  }

  /**
   * 0 移动到最底层
   * 1 上移一层
   * 2 移动到最顶层
   * -1 下移一层
   * @param index
   */
  setZIndex(index) {

  }

}

export default GraphicClusterLayer;
