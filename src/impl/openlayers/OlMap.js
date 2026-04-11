/**
 * 创建openlayer的地图
 * @param target  // 地图容器
 * @param options {url:'http:// mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G',
 *                 longitude:113, // 中心点经度
 *                 latitude:23, // 中心点纬度
 *                 zoom:10, // 缩放级别
 *                 projection:'4326' // 空间坐标系
 *                 }
 * @returns 返回olmap对象而不是地图map
 * @constructor
 */
import {isDefined, isUndefined} from "../../common/util"
import {BaseMapLayerType} from "../../map/TsMapConstants";
import WmsLayer from "./layer/WmsLayer";
import Draw from "./interaction/Draw";
import WmtsLayer from "./layer/WmtsLayer";
import GraphicLayer from "./layer/GraphicLayer";
import OverlayLayer from "./overlay/OverlayLayer";
import WfsLayer from "./layer/WfsLayer";
import ClusterLayer from "./layer/ClusterLayer";
import GeoJSONLayer from "./layer/GeoJSONLayer";
import HeatMapLayer from "./layer/HeatMapLayer";
import RouteLayer from "./layer/RouteLayer";
import TrackLayer from "./layer/TrackLayer";
import Popups from "./overlay/Popups";
import Measure from "./tool/Measure";
import Geocoder from "./tool/Geocoder";
import LocalSearch from "./tool/LocalSearch";
import RainLayer from "./layer/RainLayer";
import WindyLayer from "./layer/WindyLayer";
import FeatureLayer from "./overlay/FeatureLayer";
import AnimateLayer from "./layer/AnimateLayer";
import TyphoonLayer from "./layer/TyphoonLayer";
import ImageLayer from "./layer/ImageLayer";
import PointAnimateLayer from "./layer/PointAnimateLayer";
import PopupsRight from "./overlay/PopupsRight";
import SelectionIndicator from "./overlay/SelectionIndicator";
import EGISWMTSLayer from "./layer/EGISWMTSLayer";
import GraphicClusterLayer from "./layer/GraphicClusterLayer";
import TrafficLayer from "./layer/TrafficLayer";
import Styles from "./style/Styles";
import TestStyle from "./style/TestStyle";
import DraughtDraw from "./layer/DraughtDraw";
import PointBillboardLayer from "./layer/PointBillboardLayer";
import EchartLayer from "./layer/EchartLayer";
import BDImagerySource from "./layer/BDImagerySource";
import BingMaps from "./layer/BingMaps";
import Events from "./layer/Events";
import HighlightedLayer from "./layer/HighlightedLayer";
import BasicImagerLayer from "./base/BasicImagerLayer";
import CircleFrameLayer from "./layer/CircleFrameLayer";
import WmsFeatureLayer from "./layer/WmsFeatureLayer";
import TileLayer from "./layer/TileLayer";
import MaskFilterLayer from "./layer/MaskFilterLayer";
import FlowLayer from "./layer/FlowLayer";
import ClusterAttrLayer from "./layer/ClusterAttrLayer";

class OlMap {

  constructor(options) {
    this.options = options;

    if (isUndefined(this.options)) {
      return
    }

    this.zoom = this.options.zoom;
    // 默认返回天地图影像图层
    this.baseLayer = createBaseLayer(this.options);
    this.annoLayer = null; // 标注图层
    this.zoomControl = null;//缩放控件
    this.rotateControl = null;//添加旋转控件
    this.scaleLineControl = null;//添加比例尺
    this.overviewMap = null;//鹰眼
    this.popupsRight = null;//右侧弹窗
    this.selectionIndicator = null;//选中框

    var viewobject = {
      center: transCenterByProjection(this.options.center, this.options.projection),
      projection: 'EPSG:' + this.options.projection,
      zoom: this.options.zoom,
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom
    };
    if (this.options.extent) {
      viewobject.extent = this.options.extent;
    }
    this.view = new ol.View(viewobject);

    //this.view.setMinZoom(this.options.minZoom);
    //this.view.setMaxZoom(this.options.maxZoom);

    /**
     * 创建的openlayer的map
     */
    this.map = new ol.Map({
      layers: [this.baseLayer],
      target: this.options.target,
      view: this.view,
      controls: null
    });
    this._event = new Events();
    this._wmsevent = new Events();
    this._moveendevent = new Events();
    this._eventMove = new Events();

    this.map._event = this._event;
    this.map._eventMove = this._eventMove;
    let controls = this.map.getControls();

    if (controls) {
      for (const v of controls.getArray()) {
        this.map.removeControl(v)
      }
    }

    let scale = 0;
    let _this = this;
    let dpi = 25.4 / 0.28;
    let units = _this.view.getProjection().getUnits();
    let mpu = ol.proj.Units.METERS_PER_UNIT[units];
    this.view.on('change:resolution', function (evt) {
      let resolution = evt.target.get('resolution');


      scale = resolution * mpu * 39.37 * dpi;

      if (scale >= 9500 && scale <= 950000) {
        scale = Math.round(scale / 1000) + "K";
      } else if (scale >= 950000) {
        scale = Math.round(scale / 1000000) + "M";
      } else {
        scale = Math.round(scale);
      }

      // 获取当前地图的缩放级别
      _this.zoom = _this.getView().getZoom();
    });

    this.map.on('singleclick', function (e) {
      let pixel = _this.map.getEventPixel(e.originalEvent);
      _this.zoom = _this.view.getZoom();  // 获取当前地图的缩放级别

      var screen = pixel;
      let features = [];
      _this.map.forEachFeatureAtPixel(pixel, function (feature) {
        features.push(feature);
      });
      // 地图单击返回对象
      let object = {
        coordinate: e.coordinate,
        features: [],
        zoom: _this.zoom,
        screen: screen
      };

      if (features.length > 0) {
        var newFeatures = [];
        for (var i = 0; i < features.length; i++) {
          var feature = features[i];
          if (feature.getGeometry().getType() === "Point") {
            object.coordinate = feature.getGeometry().flatCoordinates;

          }
          var attr = feature.getKeys();
          var properties = {};
          var clusterFeatures = null;
          for (let i = 0; i < attr.length; i++) {
            let item = attr[i];
            if (item !== 'geometry') {
              if (item == "features") {
                clusterFeatures = feature.get(item);
                break;
              } else {
                properties[item] = feature.get(item);
              }
            }
          }
          // 处理聚合
          if (clusterFeatures) {
            properties = {};
            if (clusterFeatures.length == 1) {

              var clfeature = clusterFeatures[0];
              newFeatures.push(clfeature);
              var attr = clfeature.getKeys();
              for (let i = 0; i < attr.length; i++) {
                let item = attr[i];
                if (item !== 'geometry') {
                  properties[item] = clfeature.get(item);
                }
              }
            } else {
              var gfeature = clusterFeatures[0];
              feature._layer = gfeature._layer;
              properties = {
                count: clusterFeatures.length,
                gid: feature.get("gid")
              }
              newFeatures.push(feature);
            }
          } else {
            newFeatures.push(feature);
          }

          object.features.push({
            feature: feature,
            oluid: feature.ol_uid,
            id: feature.getId(),
            layer: feature.get('name'),
            properties: properties
          })
        }
        _this._event.raiseEvent(newFeatures, object, "click");
      } else {
        _this._wmsevent.wmsraiseEvent(features, object, "click");
        if (_this._highLightlayer) {
          _this._highLightlayer.clear();
        }
      }

      if (_this.mapClickCallback) {
        _this.mapClickCallback(features, object);
      }
    });
    this.map.on('pointermove', function (e) {
      let p = _this.view.getProjection();
      _this.zoom = _this.view.getZoom();  // 获取当前地图的缩放级别
      let pixel = _this.map.getEventPixel(e.originalEvent);
      var screen = pixel;
      let features = [];
      _this.map.forEachFeatureAtPixel(pixel, function (feature) {
        features.push(feature);
      });
      let res = {
        scale: scale,
        coordinate: [],
        zoom: _this.zoom,
        features: [],
        screen: screen
      };
      if (p.getCode() === 'EPSG:3857') {
        res.coordinate = ol.proj.transform(e.coordinate, p.getCode(), 'EPSG:4326');
      } else if (p.getCode() === 'EPSG:4326') {
        res.coordinate = e.coordinate;
      }
      if (features.length > 0) {
        for (var i = 0; i < features.length; i++) {
          var feature = features[i];
          var attr = feature.getKeys();
          var properties = {};
          for (let i = 0; i < attr.length; i++) {
            let item = attr[i];
            if (item !== 'geometry')
              properties[item] = feature.get(item);
          }
          res.features.push({
            feature: feature,
            oluid: feature.getId(),
            id: feature.getId(),
            layer: feature.get('name'),
            properties: properties
          })
        }
        _this._eventMove.raiseEvent(features, res);
      } else {
        _this._eventMove.raiseEventEmpty(res);
      }
      if (_this.coordinateCallback) {
        _this.coordinateCallback(res);
      }
    });
    this.map.on('moveend', function (e) {
      var zoom = _this.view.getZoom();  // 获取当前地图的缩放级别
      _this._moveendevent.moveendEvent(zoom);
      var layers = _this.map.getAllLayers();  // 获取当前地图的缩放级别
      var length = layers.length;
      for (var i = 0; i < length; i++) {
        var layer = layers[i];
        if (layer._distance) {
          if (layer._distance[1] >= zoom && layer._distance[0] <= zoom) {
            layer.setVisible(true)
          } else {
            layer.setVisible(false);
          }
        }
      }


    });

  }

  /**
   * 获取地图
   * @returns {ol.Map}
   */
  getMap() {
    return this.map;
  }

  getView() {
    return this.map.getView();
  }

  setHighLight(obj) {
    if (obj) {
      if (!this._highLightlayer) {
        this._highLightlayer = new HighlightedLayer();
      }
      if (obj.style) {
        this._highLightlayer.setStyle(obj.style);
      } else {
        this._highLightlayer.setStyle({
          fill: 'rgba(252,4,24,0.5)',
          color: 'rgba(250,4,33,0.5)'
        });
      }


    } else {
      if (this._highLightlayer) {
        this._highLightlayer.clear();
      }
      this._highLightlayer = null;
    }

  }

  clearCoordinateCallback() {
    this.coordinateCallback = undefined;
  };

  clearMapClickCallback() {
    this.mapClickCallback = undefined;
  };

  getLayers() {
    return this.map.getLayers();
  };

  getZoom() {
    return this.view.getZoom();  // 获取当前地图的缩放级别
  };

  getPopups() {
    if (isUndefined(this.popup))
      this.popup = new Popups(this.map);
    return this.popup;
  }

  getPopupsRight() {
    if (isUndefined(this.popupsRight)) {
      this.popupsRight = new PopupsRight(this.map);
    }
    return this.popupsRight;
  }

  getSelectionIndicator() {
    if (isUndefined(this.selectionIndicator)) {
      this.selectionIndicator = new SelectionIndicator(this.map);
    }
    return this.selectionIndicator;
  }

  /**
   * 添加缩放按钮
   * @param options
   */
  addZoom(options) {
    if (!this.zoomControl) {
      this.zoomControl = new ol.control.Zoom({
        className: options['className'],
        duration: options['duration'],
        target: options['target'],
        delta: options['delta']
      });
      this.map.addControl(this.zoomControl);
      return this.zoomControl;
    } else {
      this.map.removeControl(this.zoomControl);
      this.zoomControl = null;
      this.zoomControl = new ol.control.Zoom({
        className: options['className'],
        duration: options['duration'],
        target: options['target'],
        delta: options['delta']
      });
      this.map.addControl(this.zoomControl);
    }

  }

  /**
   * 移除缩放控件
   */
  removeZoom() {
    if (this.zoomControl) {
      this.map.removeControl(this.zoomControl);
    }
  }

  /**
   * 添加旋转控件
   *
   * @param options
   */
  addRotate(options) {
    if (this.rotateControl) {
      this.map.removeControl(this.rotateControl);
      this.rotateControl = null;
      this.rotateControl = new ol.control.Rotate({
        className: options['className'],
        duration: options['duration'],
        label: options['resetNorth'],
        autoHide: options['autoHide'],
        target: options['target']
      });
      this.map.addControl(this.rotateControl);
      return this.rotateControl;
    } else {
      this.rotateControl = new ol.control.Rotate({
        className: options['className'],
        duration: options['duration'],
        label: options['resetNorth'],
        autoHide: options['autoHide'],
        target: options['target']
      });
      this.map.addControl(this.rotateControl);
      return this.rotateControl;
    }
  }

  /**
   * 移除旋转控件
   */
  removeRotate() {
    if (this.rotateControl) {
      this.map.removeControl(this.rotateControl);
    }
  }

  /**
   * 添加比例尺
   *
   * @param options
   */
  addScaleLine(options) {
    if (this.scaleLineControl) {
      this.map.removeControl(this.scaleLineControl);
      this.scaleLineControl = null;
      this.scaleLineControl = new ol.control.ScaleLine({
        className: options['className'],
        duration: options['duration'],
        label: options['resetNorth'],
        autoHide: options['autoHide'],
        target: options['target']
      });
      this.map.addControl(this.scaleLineControl);
      return this.scaleLineControl;
    } else {
      this.scaleLineControl = new ol.control.ScaleLine({
        className: options['className'],
        duration: options['duration'],
        label: options['resetNorth'],
        autoHide: options['autoHide'],
        target: options['target']
      });
      this.map.addControl(this.scaleLineControl);
      return this.scaleLineControl;
    }
  }

  removeScaleLine() {

  }

  /**
   * 添加全屏控件
   *
   * @param options
   */
  addFullScreen(options) {
    let res = new ol.control.FullScreen({
      className: options['className'],
      label: options['label'],
      labelActive: options['labelActive'],
      keys: options['keys'],
      target: options['target'],
      source: options['source']
    });

    this.map.getControls().push(res);

    return res;
  }

  /**
   * 添加鹰眼控件
   *
   * @param options
   */
  addOverviewMap(options) {
    if (this.overviewMap) {
      this.map.removeControl(this.overviewMap);
      this.overviewMap = new ol.control.OverviewMap({
        layers: [createBaseLayer(this.options)]
      });
      this.map.addControl(this.overviewMap);
    } else {
      this.overviewMap = new ol.control.OverviewMap({
        layers: [createBaseLayer(this.options)]
      });
      this.map.addControl(this.overviewMap);
    }
  }

  /**
   *移除鹰眼
   */
  removeOverviewMap() {
    if (this.overviewMap) {
      this.map.removeControl(this.overviewMap);
    }
    this.overviewMap = null;

  }

  /**
   * 添加鼠标位置控件
   *
   * @param options
   */
  addMousePosition(options) {
    let res = new ol.control.MousePosition({
      className: (options['className'] ? options['className'] : 'ol-mouse-position'),
      coordinateFormat: (options['coordinateFormat'] ? options['coordinateFormat'] : undefined),
      projection: (options['projection'] ? options['projection'] : this.view.getProjection()),
      undefinedHTML: (options['undefinedHTML'] && typeof options['undefinedHTML'] === 'string' ? options['undefinedHTML'] : '无坐标'),
      target: (options['target'] ? options['target'] : undefined)
    });

    this.map.getControls().push(res);

    return res;
  }

  /**
   * 添加缩放条控件
   *
   * @param options
   */
  addZoomSlider(options) {
    let res = new ol.control.ZoomSlider({
      duration: options['duration'],
      pixelDelta: options['pixelDelta'],
      className: options['className'],
      target: options['target']
    });

    this.map.getControls().push(res);

    return res;
  }

  /**
   * 添加定位控件
   *
   * @param options
   */
  addZoomToExtent(options) {
    let res = new ol.control.ZoomToExtent({
      className: (options['className'] ? options['className'] : 'ol-zoom-extent'),
      label: (options['label'] ? options['label'] : 'E'),
      tipLabel: (options['tipLabel'] && typeof options['tipLabel'] === 'string' ? options['tipLabel'] : '缩放到范围'),
      extent: (options['extent'] ? options['extent'] : undefined)
    });

    this.map.getControls().push(res);

    return res;
  }

  /**
   * 移除影像
   */
  removeBaseLayer() {
    if (this.baseLayer) {
      this.map.removeLayer(this.baseLayer);
      this.baseLayer = null;
    }
  }

  /**
   * 移除标注
   */
  removeAnnoLayer() {
    if (this.annoLayer) {
      this.map.removeLayer(this.annoLayer);
      this.annoLayer = null;
    }
  }

  getMaxZoom() {
    this.view.getMaxZoom();
  };

  getMinZoom() {
    this.view.getMinZoom();
  };

  /**
   * 添加wms图层
   * @param options
   * @returns {WmtsLayer}
   */
  addWmtsLayer(options) {
    return new WmtsLayer(this.map, options);
  }

  addWmsLayer(options) {
    return new WmsLayer(this.map, options);
  }

  /**
   * 粤政图实时路况
   * @param options
   * @returns {TrafficLayer}
   */
  addTrafficLayer(options) {
    return new TrafficLayer(this.map, options);
  }

  /**
   * 添加div点
   * @returns {PointBillboardLayer}
   */
  addPointBillboardLayer(options) {
    return new PointBillboardLayer(this.map, options);
  }


  /**
   * egis和粤政图wmst地图
   * @param options
   * @returns {EGISWMTSLayer}
   */
  addEGisWmtsLayer(options) {
    return new EGISWMTSLayer(this.map, options);
  }

  /**
   * 添加wfs图层
   * @param options
   * @returns {WfsLayer}
   */
  addWfsLayer(options) {
    return new WfsLayer(this.map, options);
  }

  /**
   * 加载3dtileset图层
   * @param object
   * @returns {TileLayer}
   */
  addTileLayer(object) {
    return new TileLayer();
  }

  /**
   * 图形图层
   * @param options
   * @returns {GraphicLayer}
   */
  addGraphicLayer(options) {
    return new GraphicLayer(this.map, options);
  }

  /**
   * 图像的聚合 统一使用addClusterLayer
   * @param options
   * @returns {GraphicClusterLayer}
   */

  /*addGraphicClusterLayer(options) {
      return new GraphicClusterLayer(this.map, options);
  }*/

  /**
   * json数据图层
   * @param options
   * @returns {GeoJSONLayer}
   */
  addGeoJSONLayer(options) {
    return new GeoJSONLayer(this.map, options);
  }

  /**
   * 要素图层查询
   * @param options
   * @returns {FeatureLayer}
   */
  addFeatureLayer(options) {
    return new FeatureLayer(this.map, options);
  }

  /**
   * wmts图层
   * @param options
   * @returns {WmtsLayer}
   */
  addWmtsLayer(options) {
    return new WmtsLayer(this.map, options);
  }

  /**
   * 聚合图层
   * @param options
   * @returns {ClusterLayer}
   */
  addClusterLayer(options) {
    return new ClusterLayer(this.map, options);
  }

  /**
   * 9.12属性聚合
   * @param options
   * @returns {ClusterLayer}
   */
  addClusterAttrLayer(options) {
    return new ClusterAttrLayer(this.map, options);
  }

  /**
   * 热力图
   * @param options
   * @returns {HeatMapLayer}
   */
  addHeatMapLayer(options) {
    return new HeatMapLayer(this.map, options);
  }

  /**
   * 驾车线路
   * @param options
   * @returns {RouteLayer}
   */
  addRouteLayer(options) {
    return new RouteLayer(this.map, options);
  }

  /**
   * 轨迹回放
   * @param options
   * @returns {TrackLayer}
   */
  addTrackLayer(options) {
    return new TrackLayer(this.map, options);
  }

  /**
   * 台风
   * @param options
   * @returns {TyphoonLayer}
   */
  addTyphoonLayer(options) {
    return new TyphoonLayer(this.map, options);
  }

  /**
   * 绘图
   * @param options
   * @returns {Draw}
   */
  addDraw(options) {
    return new Draw(this.map, options);
  }

  addStyle(options) {
    if (this.styleSet) {
      return this.styleSet;
    } else {
      this.styleSet = new Styles();
      return this.styleSet;
    }
  }

  addTestStyle(options) {
    if (this.styleText) {
      return this.styleText;
    } else {
      this.styleText = new TestStyle();
      return this.styleText;
    }
  }

  /**
   * 测量面积距离
   * @param options
   * @returns {Measure}
   */
  addMeasure(options) {
    return new Measure(this.map, options);
  }

  /**
   * 地理编码
   */
  addGeocoder(options) {
    return new Geocoder(this.map, options);
  }

  /**
   * 天地图搜索
   */
  addLocalSearch(options) {
    return new LocalSearch(this.map, options);
  }

  /**
   * 降雨预报
   * @param options
   * @returns {RainLayer}
   */
  addRainLayer(options) {
    return new RainLayer(this.map, options);
  }

  /**
   * 风场
   * @param options
   * @returns {WindyLayer}
   */
  addWindyLayer(options) {
    return new WindyLayer(this.map, options);

  }

  /**
   * 图片图层
   * @param options
   * @returns {ImageLayer}
   */
  addImageLayer(options) {
    return new ImageLayer(this.map, options);

  }

  /**
   * 半径圆扩散动画
   * @param options
   * @returns {PointAnimateLayer}
   */
  addPointAnimateLayer(options) {
    return new PointAnimateLayer(this.map, options);
  }

  addCircleFrameLayer(options) {
    return new CircleFrameLayer(this.map, options);
  }

  /**
   * 标会
   * @param options
   * @returns {DraughtDraw}
   */
  addDraughtDraw(options) {
    return new DraughtDraw(this.map, options);
  }

  /**
   * 动画效果
   * @param options
   * @returns {AnimateLayer}
   */
  addAnimateLayer(options) {
    return new AnimateLayer(this.map, options);

  }

  addOverlay(options) {
    return new OverlayLayer(this.map, options);
  }

  /**
   * echart 图层
   * @returns {EchartLayer}
   */
  addEchartLayer(options) {
    return new EchartLayer(this.map, options);
  }

  /**
   * 交通图
   * @param options
   * @returns {FlowLayer}
   */
  addFlowLayer(options) {
    return new FlowLayer(this.map, options);
  }

  addWmsFeatureLayer(options) {
    return new WmsFeatureLayer(this.map, options, this);
  }

  /**
   * 设置底图
   * @param object{type:vec_c// 天地图矢量底图}
   *             img_w天地图影像地图
   *             cva_w天地图矢量注记
   *             cia_w天地图影像注记
   *             默认是谷歌影像底图
   */
  setBaseLayer(type, options) {
    /*if (isUndefined(type)) {
        return
    }*/
    let layersArray = this.map.getLayers();
    switch (type) {
      case BaseMapLayerType.VEC_C:// 天地图矢量底图
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.options.baseMapLayerType = type;
        this.baseLayer = createBaseLayer(this.options, BaseMapLayerType.VEC_C);
        layersArray.insertAt(0, this.baseLayer);
        break;
      case BaseMapLayerType.CVA_W:// 天地图矢量注记
        this.removeAnnoLayer();
        this.annoLayer = createBaseLayer(this.options, BaseMapLayerType.CVA_W);
        layersArray.insertAt(1, this.annoLayer);
        break;
      case BaseMapLayerType.IMG_W:// 天地图影像地图
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.options.baseMapLayerType = type;
        this.baseLayer = createBaseLayer(this.options, BaseMapLayerType.IMG_W);
        layersArray.insertAt(0, this.baseLayer);
        break;
      case BaseMapLayerType.CIA_W:// 天地图影像注记
        this.removeAnnoLayer();
        this.annoLayer = createBaseLayer(this.options, BaseMapLayerType.CIA_W);
        layersArray.insertAt(1, this.annoLayer);
        break;
      case BaseMapLayerType.BAIDU:
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.baseLayer = createBaseLayer(this.options, BaseMapLayerType.BAIDU, options);
        layersArray.insertAt(0, this.baseLayer);
        break
      case BaseMapLayerType.BINGMAP:
        if (options && options.url) {
          this.removeBaseLayer();
          this.removeAnnoLayer();
          this.baseLayer = createBaseLayer({baseMap: BaseMapLayerType.BINGMAP}, BaseMapLayerType.BINGMAP, options);
          layersArray.insertAt(1, this.baseLayer);
        }
        break;
      case BaseMapLayerType.blue:// arcgis 典雅蓝黑
      case BaseMapLayerType.community:// arcgis 经典彩色
      case BaseMapLayerType.gray:// arcgis 低调灰色
      case BaseMapLayerType.topo:// arcgis 经典
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.baseLayer = BasicImagerLayer.getImageLayer(type);
        layersArray.insertAt(0, this.baseLayer);
        break;
      case BaseMapLayerType.URL:// arcgis 经典
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.baseLayer = createBaseLayer(options);
        layersArray.insertAt(0, this.baseLayer);
        break;
      case "egis":
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.baseLayer = neweGisLayer(options);
        layersArray.insertAt(0, this.baseLayer);
        break;
      case "egislabel":
        this.removeAnnoLayer();
        this.annoLayer = neweGisLayer(options);
        layersArray.insertAt(1, this.annoLayer);
        break;
      default:
        this.removeAnnoLayer();
        break;
    }

  };

  /**
   * egis
   * @param object
   */
  setEGisLayer(object) {
    let str = "&tilematrixset=c&Service=WMTS&Request=GetTile&Version=";

    if (object.url && object.layer) {
      let index = 0;
      if (object.index) {
        index = object.index;
      }
      let layersArray = this.map.getLayers();
      if (index === 0) {
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.baseLayer = eGisLayer({
          url: object.url,
          layer: object.layer
        }, str);
        layersArray.insertAt(index, this.baseLayer);
      } else {
        this.removeAnnoLayer();
        this.annoLayer = eGisLayer({
          url: object.url,
          layer: object.layer
        }, str);
        layersArray.insertAt(index, this.annoLayer);
      }

    }
  }

  /**
   * 粤政图
   * @param object
   */
  setYZTLayer(object) {
    let str = "&tilematrixset=c&Service=WMTS&Version=";
    if (object.url && object.layer) {
      let index = 0;
      if (object.index) {
        index = object.index;
      }
      let layersArray = this.map.getLayers();
      if (index === 0) {
        this.removeBaseLayer();
        this.removeAnnoLayer();
        this.baseLayer = eGisLayer({
          url: object.url,
          layer: object.layer
        }, str);
        layersArray.insertAt(index, this.baseLayer);
      } else {
        this.removeAnnoLayer();
        this.annoLayer = eGisLayer({
          url: object.url,
          layer: object.layer
        }, str);
        layersArray.insertAt(index, this.annoLayer);
      }

    }
  }

  /**
   * 设置地图缩放最大最小级别
   *
   * @param max:20,// 地图最大缩放
   * @param min:1 // 地图最小缩放
   */
  setZoomLimit(minZoom, maxZoom) {
    if (isDefined(minZoom)) {
      this.view.setMinZoom(minZoom);
    }
    if (isDefined(maxZoom)) {
      this.view.setMaxZoom(maxZoom);
    }
  };

  setMinZoom(minZoom) {
    if (isDefined(minZoom)) {
      this.view.setMinZoom(minZoom);
    }
  };

  setMaxZoom(maxZoom) {
    if (isDefined(maxZoom)) {
      this.view.setMaxZoom(maxZoom);
    }
  };

  setTarget(target) {
    this.map.setTarget(target);
  };

  /**
   * 设置旋转
   */
  setRotate(bol) {

    if (!bol) {
      this.view.setRotation(0);
    }
    this.map.getInteractions().forEach(function (element, index, array) {
      if (element instanceof ol.interaction.PinchRotate) {
        element.setActive(bol);
      }
      if (element instanceof ol.interaction.DragRotate) {
        element.setActive(bol);
      }
    });
  }

  /**
   * 设置地图中心和缩放级别
   *
   * @param options {center: [113, 23], zoom:10 }
   */
  setZoomAndCenter(options) {
    if (isUndefined(options)) {
      return;
    }
    let lon = 113;
    let lat = 23;
    if (options.latitude) {
      lat = parseFloat(options.latitude);
    }
    if (options.longitude) {
      lon = parseFloat(options.longitude);
    }

    let zoom = 0;
    if (options.zoom) {
      zoom = parseFloat(options.zoom);
      if (zoom > 20) {
        zoom = 15;
      }
      //this.view.setCenter(transCenterByProjection(options.center, this.options.projection));
    } else {
      zoom = this.view.getZoom()
    }
    let duration = 3000;
    if (options.duration) {
      duration = parseFloat(options.duration) * 1000;
    }

    this.view.animate({
      zoom: zoom,
      duration: duration,
      center: [lon, lat]
    });

    if (options.scale == false) {
      return;
    }
    /*if (isDefined(options.zoom)) {
        this.view.setZoom(options.zoom);
    }*/
  };

  flyTo(object) {

    if (!object || object.coordinates.length == 0)
      return;
    var west = object.coordinates[0][0];
    var south = object.coordinates[0][1];
    var east = object.coordinates[0][0];
    var notrh = object.coordinates[0][1];
    for (var i = 0; i < object.coordinates.length; i++) {
      var item = object.coordinates[i];
      west = west > item[0] ? item[0] : west;
      south = south > item[1] ? item[1] : south;
      east = east < item[0] ? item[0] : east;
      notrh = notrh < item[1] ? item[1] : notrh;
    }
    south -= 0.001;
    notrh += 0.001;
    let duration = 3;
    if (object.duration) {
      duration = parseFloat(object.duration);
    }
    duration = duration * 1000;

    this.view.fit([west, south, east, notrh], {
      duration: duration
    });

  };


  setCoordinateCallback(callback) {
    this.coordinateCallback = callback;
  };

  setMapClickCallback(callback) {
    this.mapClickCallback = callback;
  };

  /**
   * 獲取地圖中心位置
   * @returns {*}
   */
  getCenter() {
    var mapExtent = this.view.calculateExtent(this.map.getSize());
    var point = ol.extent.getCenter(mapExtent);
    //this.view.getZoom();
    return {
      center: point,
      zoom: this.view.getZoom()
    };
  }

  getPixelFromCoordinate(coordinate) {
    var mapExtent = this.map.getPixelFromCoordinate(coordinate);

    return {x: mapExtent[0], y: mapExtent[1]};
  }

  /**
   *  获取圆半径圆的坐标
   * @param object
   * @returns {{coordinate: *, type: string}}
   */
  getCircle(object) {
    return Draw.getCircle(object);
  }

  getCircular(object) {
    return Draw.getCircular(object);
  }

  /**
   * 获取经纬度坐标数组的距离
   * @param object{coordinate: [[经度,纬度]] //长度大于等于2}
   */
  getXYLength(object) {
    return Measure.distanceXY(object, this.map);
  }

  getAreaAndLength(object) {
    return {
      area: Measure.ringArea(object, this.map),
      distance: Measure.distanceXY(object, this.map)
    }
  }

  addHighlightedLayer(object) {
    return new HighlightedLayer(object);
  }

  //ol-ext
  addMaskFilterLayer(object) {
    if (this.maskFilter) {
      return this.maskFilter;
    }
    this.maskFilter = new MaskFilterLayer(this.map, object);
    return this.maskFilter;

  }

  /**
   * 获取风圈
   */
  getQuad(center, radius_quad) {
    return TyphoonLayer.getQuad(center, radius_quad);
  }
}

function transCenterByProjection(center, projection) {
  let targetCenter = center;

  if (isDefined(center)) {
    if ('EPSG:3857' === projection) {
      // 地图中心点-经纬度坐标
      targetCenter = ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857');
    }
  }

  return targetCenter;
}

//加载地图底图
function createBaseLayer(options, baseMapLayerType, object) {
  if (isUndefined(options)) {
    return null;
  }

  let targetBaseMapLayerType = baseMapLayerType ? baseMapLayerType : options.baseMapLayerType;
  targetBaseMapLayerType = targetBaseMapLayerType ? targetBaseMapLayerType : 'img_w';
  switch (options.baseMap) {
    case "ARCGIS":
      var url = options.baseMapLayerUrlMap.get("ARCGIS").get("img_w");
      let img_w = new ol.layer.Tile({
        source: new ol.source.TileArcGISRest({
          url: url
        }) //
      });
      return img_w;
      /*return new ol.layer.Tile({
        source: new ol.source.XYZ({
          preload: Infinity,
          url: url,
          projection: 'EPSG:4326',
          tileSize: 512, // the tile size supported by the ArcGIS tile service
          maxResolution: 180 / 512, // Esri's tile grid fits 180 degrees on one 512 px tile
          wrapX: true,
        })
      });*/
      break;
    case "bingmap":
      var url = options.url;
      return BingMaps.getBingMaps(object.url);
      break;
    case BaseMapLayerType.blue:// arcgis 典雅蓝黑
    case BaseMapLayerType.community:// arcgis 经典彩色
    case BaseMapLayerType.gray:// arcgis 低调灰色
    case BaseMapLayerType.topo:// arcgis 经典
      return BasicImagerLayer.getImageLayer(options.baseMap);
      break;

    default:
      switch (targetBaseMapLayerType) {
        case BaseMapLayerType.BAIDU:
          //var url = "https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20220221&scale=1&ak=LPQAVkzSThbmIRI1YVo8VuzwlTrQG9T1&styles=t%3Aland%7Ce%3Ag%7Cc%3A%230A1831%2Ct%3Abuilding%7Ce%3Ag%7Cc%3A%231D325E%2Ct%3Ahighway%7Ce%3Aall%7Cl%3A-42%7Cs%3A-91%2Ct%3Aarterial%7Ce%3Ag%7Cl%3A-77%7Cs%3A-94%2Ct%3Agreen%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Awater%7Ce%3Ag%7Cc%3A%23181818%2Ct%3Asubway%7Ce%3Ag.s%7Cc%3A%23181818%2Ct%3Arailway%7Ce%3Ag%7Cl%3A-52%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23313131%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%238b8787%2Ct%3Amanmade%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Alocal%7Ce%3Ag%7Cc%3A%23ef10adff%7Cl%3A-75%7Cs%3A-91%7Ch%3A%239f2424%2Ct%3Asubway%7Ce%3Ag%7Cl%3A-65%2Ct%3Arailway%7Ce%3Aall%7Cl%3A-40%2Ct%3Aroad%7Ce%3Ag%7Cc%3A%231890ffff%7Cl%3A-69%7Cw%3A1%7Ch%3A%231890ff";
          var url = options.baseMapLayerUrlMap.get("TIANDITU").get(BaseMapLayerType.BAIDU);
          if (object && object.url) {
            url = options.url;
          }
          let baidu_source = BDImagerySource(url);
          return new ol.layer.Tile({
            source: baidu_source
          });

          break;
        default:

          if (options.url && options.url != "") {
            var url = options.url;

            var obj = {
              url: url,
            }
            if (options.extent) {
              var tg = ol.tilegrid.createXYZ({
                extent: options.extent
              })
              obj.tileGrid = tg
            }
            if (options.westSouthEastNorth) {
              var tg = ol.tilegrid.createXYZ({
                extent: options.westSouthEastNorth
              })
              obj.tileGrid = tg
            }
            if (options.projection) {
              obj.projection = options.projection;
            }
            return new ol.layer.Tile({
              source: new ol.source.XYZ(obj),
            });
          } else {
            var url = options.baseMapLayerUrlMap.get(options.baseMap).get(targetBaseMapLayerType) +
              options.baseMapTokens.get(options.baseMap);
            return new ol.layer.Tile({
              preload: Infinity,
              source: new ol.source.XYZ({
                url: url
              })
            });
          }

          break;
      }
      break;
  }


}

/**
 * 粤政图和egis
 * @param object
 * @param str 粤政图和egis的链接url不一样
 */
function eGisLayer(object, str) {
  let url;
  if (object.url) {
    url = object.url;
  } else {
    return;
  }
  let layer;
  if (object.layer) {
    layer = object.layer;
  } else {
    return;
  }
  let resolutions = [1.40625,
    0.703125,
    0.3515625,
    0.17578125,
    0.087890625,
    0.0439453125,
    0.02197265625,
    0.010986328125,
    0.0054931640625,
    0.00274658203125,
    0.001373291015625,
    0.0006866455078125,
    0.00034332275390625,
    0.000171661376953125,
    0.0000858306884765625,
    0.00004291534423828125,
    0.000021457672119140625,
    0.000010728836059570312,
    0.000005364418029785156,
    0.000002682209014892578,
    0.000001341104507446289];
  let version = "1.0.0";
  if (object.version) {
    version = object.version;
  }
  let epsg = 'EPSG:4326';
  if (object.epsg) {
    epsg = 'EPSG:' + object.epsg;
  }
  let origin = [
    -180,
    90
  ];
  if (object.origin) {
    origin = object.origin;
  }
  let tilegrid = new ol.tilegrid.TileGrid({
    origin: origin,    // 设置原点坐标
    resolutions: resolutions    // 设置分辨率
  });
  // 创建百度地图的数据源
  let baiduSource = new ol.source.TileImage({
    projection: epsg,
    tileGrid: tilegrid,
    tileUrlFunction: function (tileCoord, pixelRatio, proj) {
      //var z = tileCoord[0];
      //var x = tileCoord[1];
      //ivar y = tileCoord[2];
      //http://19.15.70.147:18091/maps-webapp/geography/egis?layer=img_vec_c&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix=8&TileCol=206&TileRow=47
      //var vec_c_url = "http://19.15.70.147:18091/maps-webapp/geography/egis?layer=vec_c&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix=" + z + "&TileCol=" + x + "&TileRow=" + y;
      //let vec_c_url = url + "?layer=" + layer + "&tilematrixset=c&Service=WMTS&Request=GetTile&Version=" + version + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];
      //let vec_c_url = url + "?layer=" + layer + "&tilematrixset=c&Service=WMTS&Version=" + version + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];
      let vec_c_url = url + "?layer=" + layer + str + version + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];

      return vec_c_url;
    }
  });
  let layerTile = new ol.layer.Tile({
    source: baiduSource
  });
  return layerTile;
}

function neweGisLayer(object) {
  var str = "&tilematrixset=c&Request=GetTile&Service=WMTS&Version=";

  let url;
  if (object.url) {
    url = object.url;
  } else {
    return;
  }

  let epsg = 'EPSG:4326';
  if (object.epsg) {
    epsg = 'EPSG:' + object.epsg;
  }
  let origin = [
    -180,
    90
  ];
  if (object.origin) {
    origin = object.origin;
  }
  // 创建百度地图的数据源
  let baiduSource = new ol.source.TileImage({
    projection: epsg,
    //tileGrid: tilegrid,
    tileUrlFunction: function (tileCoord, pixelRatio, proj) {
      //var z = tileCoord[0];
      //var x = tileCoord[1];
      //ivar y = tileCoord[2];
      //http://19.15.70.147:18091/maps-webapp/geography/egis?layer=img_vec_c&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix=8&TileCol=206&TileRow=47
      //var vec_c_url = "http://19.15.70.147:18091/maps-webapp/geography/egis?layer=vec_c&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix=" + z + "&TileCol=" + x + "&TileRow=" + y;
      //let vec_c_url = url + "?layer=" + layer + "&tilematrixset=c&Service=WMTS&Request=GetTile&Version=" + version + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];
      //let vec_c_url = url + "?layer=" + layer + "&tilematrixset=c&Service=WMTS&Version=" + version + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];
      let vec_c_url = url + str + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];

      return vec_c_url;
    }
  });
  let layerTile = new ol.layer.Tile({
    source: baiduSource
  });
  return layerTile;
}

export default OlMap;
