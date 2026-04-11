import {extend, hasUndefined} from "../../../common/util";
import SourceVector from "../common/SourceVector";
import Styles from "../style/Styles";

class ClusterAttrLayer {


  constructor(map, options) {
    options = options ? options : {};
    this._id = options.id;
    this.map = map;
    this.view = this.map.getView();

    this.options = extend({}, options);

    if (hasUndefined(this.map)) {
      return;
    }

    this.vectorSource = new SourceVector(this.map, this._id);
    this.vectorLayer = new ol.layer.Vector({
      source: this.vectorSource.sourceVector
    });

    this.oluid = this.vectorLayer.ol_uid;
    this.map.addLayer(this.vectorLayer);
    let zindex = this.map.getLayers().getLength();
    this.vectorLayer.setZIndex(zindex);
    this.feature = null;
    this.coordinates = null;
    this.featureCollection = [];
    var that = this;

    this.visible = true;

    function setLayerVisi() {
// 方法1: 使用 getZoom() 方法
      var currentZoomLevel = that.view.getZoom();
      console.log('当前层级:', currentZoomLevel);

      var vslayer = {
        show: null,
        nhow: []
      }

      for (var index in that.attrObject) {
        var item = that.attrObject[index];
        var lyaer = that.attrLayer[index];
        if (lyaer) {
          if (item.distance >= currentZoomLevel) {
            if (vslayer.show) {
              if (vslayer.show.attr.distance >= item.distance) {
                vslayer.nhow.push(vslayer.show);
                vslayer.show = {
                  attr: item,
                  layer: lyaer
                }
              } else {
                vslayer.nhow.push({
                  attr: item,
                  layer: lyaer
                });
              }
            } else {
              vslayer.show = {
                attr: item,
                layer: lyaer
              }
            }
          } else {
            vslayer.nhow.push({
              attr: item,
              layer: lyaer
            });
          }
        }

      }
      if (vslayer.show) {
        vslayer.show.layer.vectorLayer.setVisible(true);
        that.vectorLayer.setVisible(false);
      } else {
        that.vectorLayer.setVisible(true);
      }
      for (var i = 0; i < vslayer.nhow.length; i++) {
        var item = vslayer.nhow[i];
        item.layer.vectorLayer.setVisible(false);
      }

    }

    this.view.on('change:center', function (e) {
      if (that.visible)
        setLayerVisi();
    })


    this.attrObject = {};
    this.attrLayer = {};

    /**
     * 刷新聚合图层
     */
    this.refLevel = function () {
      for (var index in that.attrObject) {
        var item = that.attrObject[index];
        if (!this.attrLayer[index]) {
          var vectorSource = new SourceVector(that.map, that._id);
          var vectorLayer = new ol.layer.Vector({
            source: vectorSource.sourceVector
          });
          that.map.addLayer(vectorLayer);

          var ls = {
            ...item.style,
            label: "text"
          };

          var styleSet = new Styles();
          styleSet.vectorLayer = vectorLayer;

          styleSet.setStyle(ls);
          that.attrLayer[index] = {
            vectorSource: vectorSource,
            vectorLayer: vectorLayer,
            style: ls,
            styleSet: styleSet,
          }
        }
        that.attrLayer[index].vectorSource.clear();

        for (var jndex in item.features) {

          var jtem = item.features[jndex];
          var lon = jtem.lon / jtem.count;
          var lat = jtem.lat / jtem.count;
          var text = jtem.text;

          let graphic1 = {
            "geometry": {
              "type": "Point",
              "coordinates": [lon, lat]
            },
            properties: {
              text: ""+jtem.count
            }
          }
          if (text) {
            graphic1.properties.text = text + " " + jtem.count;
          }
          that.attrLayer[index].vectorSource.addFeature(graphic1, that);
        }
      }
      if (that.visible)
        setLayerVisi(); // 渲染地图
    }
    this._resfush = function () {
      setLayerVisi();
    }
  }


  addGraphic(object) {

    var properties = object.properties;
    let geometry = object.geometry ? object.geometry : null,
      coords = geometry ? geometry.coordinates : null;
    if (!coords && !geometry) {
      return null;
    }
    if (properties) {
      for (var index in this.attrObject) {
        var item = this.attrObject[index];
        var label = item.style.label;
        var key = item.key;
        var value = properties[key];
        var labelv = properties[label];

        if (!item.features[value]) {
          item.features[value] = {
            count: 0,
            lon: 0,
            lat: 0,
            text: labelv
          }
        }
        item.features[value].count++;
        var lon = item.style.lon;
        var lat = item.style.lat;
        var lonv = properties[lon];
        var latv = properties[lat];
        if (lonv && latv) {
          item.features[value].lon +=lonv;
          item.features[value].lat += latv;
        } else {
          item.features[value].lon += coords[0];
          item.features[value].lat += coords[1];
        }

      }
    }

    return this.vectorSource.addFeature(object, this);

  }


  addFeature(object) {
    var feature = this.addGraphic(object);
    return feature;
  };

  addFeatures(object) {
    for (let i = 0; i < object.length; i++) {
      let item = object[i];
      this.addGraphic(item);
    }
  };

  /**
   * 设置图层的可见性
   * @param visible true/false
   */
  setVisible(visible) {
    if (this.attrLayer) {
      for (var index in this.attrLayer) {
        var item = this.attrLayer[index];
        item.vectorLayer.setVisible(visible);
      }

    }
    this.visible = visible;
    this.vectorLayer.setVisible(visible);
    if (visible) {
      this._resfush();
    }


  };

  getVisible() {
    return this.vectorLayer.getVisible();
  };

  /**
   * 移除图层,移除后需要用 setDataSource从新添加
   */
  removeLayer() {
    this.removeClick();
    this.moveClick();
    this.map.removeLayer(this.vectorLayer);
    if (this.attrLayer) {
      for (var index in this.attrLayer) {
        var item = this.attrLayer[index];
        item.vectorLayer.clear();
        this.map.removeLayer(item.vectorLayer);

      }

    }


    if (this.vectorSource) {
      this.vectorSource.clear();
      this.vectorSource = null;
    }

    this.vectorLayer = null;
  };

  /**
   * 通过要素或者id移除一个要素
   * @param feature
   */
  removeFeature(feature) {
    this.vectorSource.removeFeature(feature);
  }

  /**
   * 通过id获取要素
   * @param id
   * @returns {*}
   */
  getFeatureById(id) {
    return this.vectorSource.getFeatureById(id);
  }

  length() {
    return this.vectorSource.length();
  }

  /**
   * 添加图层
   */
  addLayer() {
    if (this.vectorLayer) {
      this.map.removeLayer(this.vectorLayer);
    } else {
      this.vectorLayer = new ol.layer.Vector({
        source: this.vectorSource
      });

    }
    this.map.addLayer(this.vectorLayer);
    let zindex = this.map.getLayers().getLength();
    this.vectorLayer.setZIndex(zindex);
  }

  topLayer() {
    this.map.removeLayer(this.vectorLayer);
    this.map.addLayer(this.vectorLayer);
  };

  /**
   * 清空图层
   */
  clear() {
    if (this.attrLayer) {
      for (var index in this.attrLayer) {
        var item = this.attrLayer[index];
        item.vectorSource.clear();
      }

    }
    this.vectorSource.clear();
  };

  /**
   * 设置图层的样式
   * @param style openlayer的样式对象
   */
  setStyle(style) {

    if (style) {
      if (style.level) {
        if (style.level instanceof Array) {
          for (var i = 0; i < style.level.length; i++) {
            var item = style.level[i];
            var key = item.attr;
            if (!this.attrObject[key]) {
              this.attrObject[key] = {
                style: item,
                distance: item.distance,
                features: {},
                key: key,
              }
              if (!this.attrObject[key].style.text) {
                this.attrObject[key].style.text = {
                  ...style.text
                }
              }
            }
            this.attrObject[key].style = item;
          }
        }
      }

      if (this.vectorLayer) {
        if (!this.styleSet) {
          this.styleSet = new Styles();
        }
        this.styleSet.vectorLayer = this.vectorLayer;
        this.styleSet.setStyle(style);
        this._style = style;

      }
      if (style.distance && this.vectorLayer) {
        this.vectorLayer._distance = style.distance;
      }
    } else {
      if (this.vectorLayer) {
        this.vectorLayer._distance = null;
      }
    }
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
    var z = this.vectorLayer.getZIndex();
    var zindex = this.map.getLayers().getLength();
    let layersArray = this.map.getLayers();


    switch (index) {
      case 0:
        this.vectorLayer.setZIndex(1);
        break;
      case 2:

        this.vectorLayer.setZIndex(zindex - 1);
        break;
      case -1:
        z = z - 1;
        if (z <= 0) {
          z = 0;
        }
        this.vectorLayer.setZIndex(z);
        break;
      default:
        this.vectorLayer.setZIndex(z + 1);
        break;

    }
  }

  /**
   *  设置聚合图层的样式
   * @param options
   */
  setClusterStyle(options) {

  }


}

export default ClusterAttrLayer;