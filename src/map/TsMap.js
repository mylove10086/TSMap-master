import OlMap from "../impl/openlayers/OlMap"
//import LfMap from "../impl/leaflet/LfMap"
import {extend, isDefined, isUndefined} from "../common/util"
import {MapEngineType, DefaultOptions, BaseMapLayerUrlMap, BaseMapLayerUrlMaps} from "./TsMapConstants";
import MaskFilterLayer from "../impl/openlayers/layer/MaskFilterLayer";
import proj4 from "proj4";
import *as turf from "@turf/turf";

class TsMap {

    constructor(options) {

        let finalOptions = {};

        if (window && window.tsMapConfig) {
            finalOptions = extend(window.tsMapConfig, options);
        } else {
            finalOptions = options;
        }

        var def = this.getDefaultOptions();
        this.options = extend(def, finalOptions);

        this.mapEngine = this.options.mapEngine;
        this.zoom = this.options.zoom;
        this.center = this.options.center;
        this.projection = this.options.projection;
        this.baseMap = this.options.baseMap;
        this.target = this.options.target;

        if (isUndefined(this.options.baseMapLayerUrlMap)) {
            if (this.options.httpsFlag && this.options.httpsFlag === true) {
                this.options.baseMapLayerUrlMap = BaseMapLayerUrlMaps;
            } else {
                this.options.baseMapLayerUrlMap = BaseMapLayerUrlMap;
            }
        }

        this.map = createMap(this.options);
        proj4.defs('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
        ol.proj.proj4.register(proj4);
    }

    getDefaultOptions() {
        return {
            mapEngine: MapEngineType.OPENLAYERS,
            zoom: DefaultOptions.ZOOM,
            minZoom: DefaultOptions.MIN_ZOOM,
            maxZoom: DefaultOptions.MAX_ZOOM,
            center: DefaultOptions.CENTER,
            projection: DefaultOptions.PROJECTION,
            target: DefaultOptions.TARGET,
            baseMap: DefaultOptions.BASE_MAP,
            httpsFlag: false// 是否使用https默认不使用

        };
    }

    setHighLight(obj) {

        this.map.setHighLight(obj);

    }

    /**
     * 定位
     * @param object{longitude:43429.2763,//经度
     *               latitude: 231949.5280,//纬度
     *               zoom:13,//缩放层级
     *               duration:3 //飞行到底时间
     *               }
     */
    goTo(object) {
        if (object && object.coordinates) {
            this.map.flyTo(object);
            return;
        }
        this.map.setZoomAndCenter(object);
        /*this.map.setZoomAndCenter({
            center: [object.longitude, object.latitude],
            zoom: object.zoom,
            scale: object.scale
        });*/
    }

    flyTo(object) {

        this.map.flyTo(object);
    }

    getMap() {
        return this.map.getMap();
    }

    setZoomLimit(minZoom, maxZoom) {
        if (isDefined(minZoom)) {
            this.map.setMinZoom(minZoom);
        }
        if (isDefined(maxZoom)) {
            this.map.setMaxZoom(maxZoom);
        }
    };

    setMinZoom(minZoom) {
        if (isDefined(minZoom)) {
            this.map.setMinZoom(minZoom);
        }
    };

    setMaxZoom(maxZoom) {
        if (isDefined(maxZoom)) {
            this.map.setMaxZoom(maxZoom);
        }
    };

    /**
     * 设置在线底图
     * @param type
     */
    setBaseMap(type, options) {
        this.map.setBaseLayer(type, options);
    }

    setYZTLayer(type, options) {
        this.map.setYZTLayer(type, options);
    }

    setEGisLayer(type, options) {
        this.map.setEGisLayer(type, options);
    }

    setCoordinateCallback(callback) {
        this.map.setCoordinateCallback(callback);
    };

    clearCoordinateCallback() {
        this.map.clearCoordinateCallback();
    };

    setMapClickCallback(callback) {
        this.map.setMapClickCallback(callback);
    };

    clearMapClickCallback() {
        this.map.setMapClickCallback();
    };

    addWmtsLayer(options) {
        return this.map.addWmtsLayer(options);
    }

    addWmsLayer(options) {
        return this.map.addWmsLayer(options);
    }

    /**
     * 粤政图实时路况
     * @param options
     */
    addTrafficLayer(options) {
        return this.map.addTrafficLayer(options);
    }

    /**
     * 添加div点
     * @returns {PointBillboardLayer}
     */
    addPointBillboardLayer(options) {
        return this.map.addPointBillboardLayer(options);
    }

    /**
     * egis和粤政图wmst地图
     * @param options
     * @returns {EGISWMTSLayer}
     */
    addEGisWmtsLayer(options) {
        return this.map.addEGisWmtsLayer(options);
    }

    addWfsLayer(options) {
        return this.map.addWfsLayer(options);
    }

    addGraphicLayer(options) {
        return this.map.addGraphicLayer(options);
    }

    addFeatureLayer(options) {
        return this.map.addGraphicLayer(options);
    }

    /**
     * 图像的聚合
     * @param options
     * @returns {GraphicClusterLayer}
     */
    addGraphicClusterLayer(options) {
        return this.map.addGraphicClusterLayer(options);

    }

    addGeoJSONLayer(options) {
        return this.map.addGeoJSONLayer(options);
    }

    /**
     * 要素图层查询
     * @param options
     * @returns {FeatureLayer}
     */

    /*addFeatureLayer(options) {
        return this.map.addFeatureLayer(options);
    }*/

    addClusterLayer(options) {
        return this.map.addClusterLayer(options);
    }

    /**
     * 9.12属性聚合
     * @param options
     * @returns {ClusterLayer}
     */
    addClusterAttrLayer(options) {
        return this.map.addClusterAttrLayer(options);
    }

    addHeatMapLayer(options) {
        return this.map.addHeatMapLayer(options);
    }

    addRouteLayer(options) {
        return this.map.addRouteLayer(options);
    }

    addLocalSearch(options) {
        return this.map.addLocalSearch(options);
    }

    addTrackLayer(options) {
        return this.map.addTrackLayer(options);
    }

    addTyphoonLayer(options) {
        return this.map.addTyphoonLayer(options);
    }

    addAnimateLayer(options) {
        return this.map.addAnimateLayer(options);
    }

    /**
     * 图片图层
     * @param options
     * @returns {ImageLayer}
     */
    addImageLayer(options) {
        return this.map.addImageLayer(options);
    }

    /**
     * 降雨
     * @param options
     * @returns {RainLayer}
     */
    addRainLayer(options) {
        return this.map.addRainLayer(options);
    }

    /**
     * 风场
     * @param options
     * @returns {WindyLayer}
     */
    addWindyLayer(options) {
        return this.map.addWindyLayer(options);
    }

    /**
     * 半径圆扩散动画
     * @param options
     * @returns {PointAnimateLayer}
     */
    addPointAnimateLayer(options) {
        return this.map.addPointAnimateLayer(options);
    }

    /**
     * 与上面那个基本一样
     * @param options
     * @returns {CircleFrameLayer}
     */
    addCircleFrameLayer(options) {
        return this.map.addCircleFrameLayer(options);
    }

    addDraughtDraw(options) {
        return this.map.addDraughtDraw(options);
    }

    addDraw(options) {
        return this.map.addDraw(options);
    }

    addStyle() {
        return this.map.addStyle();
    }

    addTestStyle() {
        return this.map.addTestStyle();
    }

    addMeasure(options) {
        return this.map.addMeasure(options);
    }

    addControl(options) {
        return this.map.addControl(options);
    }

    addLayer(options) {
        return this.map.addLayer(options);
    }

    addOverlay(options) {
        return this.map.addOverlay(options);
    }

    /**
     * echart 图层
     * @returns {EchartLayer}
     */
    addEchartLayer(options) {
        return this.map.addEchartLayer(options);
    }

    addFlowLayer(options) {
        return this.map.addFlowLayer(options);
    }
    //
    addWmsFeatureLayer(options) {
        return this.map.addWmsFeatureLayer(options);
    }

    getPopupsRight(options) {
        return this.map.getPopupsRight(options);
    }

    getSelectionIndicator(options) {
        return this.map.getSelectionIndicator(options);
    }

    getTarget() {
        return this.map.getTarget();
    }

    getTargetElement() {
        return this.map.getTargetElement();
    }

    getControls() {
        return this.map.getControls();
    }

    getOverlays() {
        return this.map.getOverlays();
    }

    getOverlayById(id) {
        return this.map.getOverlayById(id);
    }

    /**
     * 禁止和启用地图旋转
     * @param bol
     */
    setRotate(bol) {
        this.map.setRotate(bol);
    }

    getLayers() {
        return this.map.getLayers();
    }

    getLoading() {
        return this.map.getLoading();
    }

    getPixelFromCoordinate(coordinate) {
        return this.map.getPixelFromCoordinate(coordinate);
    }

    /**
     * 获取经纬度的屏幕坐标
     * @param lon
     * @param lat
     * @returns {{x: *, y: *}}
     */
    getScreen(lon, lat) {
        return this.map.getPixelFromCoordinate([lon, lat]);
    }

    getSize() {
        return this.map.getSize();
    }

    getView() {
        return this.map.getView();
    }

    getViewport() {
        return this.map.getViewport();
    }

    getOverlayContainer() {
        return this.map.getOverlayContainer();
    }

    removeControl(control) {
        return this.map.removeControl(control);
    }

    removeLayer(layer) {
        return this.map.removeLayer(layer);
    }

    removeOverlay(overlay) {
        return this.map.removeOverlay(overlay);
    }

    setSize(size) {
        return this.map.setSize(size);
    }

    setTarget(target) {
        return this.map.setTarget(target);
    }

    /**
     * 獲取地圖中心位置
     * @returns {*}
     */
    getCenter() {
        return this.map.getCenter();
    }

    /**
     *  获取圆半径圆的坐标
     * @param object
     * @returns {{coordinate: *, type: string}}
     */
    getCircle(object) {
        return this.map.getCircle(object);
    }

    /**
     * 球体的圆
     * @param object
     * @returns {*}
     */
    getCircular(object) {
        return this.map.getCircular(object);
    }

    /**
     * 获取经纬度坐标数组的距离
     * @param object{coordinate: [[经度,纬度]] //长度大于等于2}
     */
    getXYLength(object) {
        return this.map.getXYLength(object);
    }
    getAreaAndLength(object) {
        return this.map.getAreaAndLength(object);
    }

    addHighlightedLayer(object) {
        return this.map.addHighlightedLayer(object);

    }

    //ol-ext
    /**
     * 使多边形外部灰色的效果
     * @param object
     * @returns {HighlightedLayer1}
     */
    addMaskFilterLayer(object) {
        return this.map.addMaskFilterLayer(object);
    }

    /**
     * 获取风圈
     * @param center
     * @param radius_quad
     * @returns {*}
     */
    getQuad(center, radius_quad){
        return this.map.getQuad(center, radius_quad);

    }
}

function createMap(options) {
    switch (options.mapEngine) {
        case MapEngineType.OPENLAYERS:
            return new OlMap(options);
        case MapEngineType.LEAFLET:
        //return new LfMap(options);
    }
}

export default TsMap;
