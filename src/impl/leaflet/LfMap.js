/**
 * 创建leaflet的地图
 * @param target  //地图容器
 * @param options {
 *                 longitude:113, //中心点经度
 *                 latitude:23, //中心点纬度
 *                 zoom:10, //缩放级别
 *                 projection:'4326' //空间坐标系
 *                 }
 * @returns 返回leaflet对象而不是地图map
 * @constructor
 */
import {defaultValue, defined} from "../common/defined";
import OnlineLFMap from "./OnlineLFMap";
import OverviewMap from "./OverviewMap";


function LFMap(target, options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    let baseUrl = "http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G";
    if (defined(options.url)) {
        baseUrl = options.url;
    }
    let _online = {key: null};
    //_online.key = options.key;
    _online.key = '0c408b2742b51c99f79f0fe2d9b63aa8';
    let lfm = new OnlineLFMap(_online);

    let _imgLayer = lfm.getLFMapImg();//默认返回谷歌影像图层
    let _labLayer = null;//标注图层
    let _ovm = null;//鹰眼的地图对象
    let _ovmL = null;//鹰眼的地图图层
    let _lon = 113;//中心点经度
    if (defined(options.longitude)) {
        _lon = options.longitude;
    }
    let _lat = 23;//中心点纬度
    if (defined(options.latitude)) {
        _lat = options.latitude;
    }
    let _zoom = 10;//缩放级别
    if (defined(options.zoom)) {
        _zoom = options.zoom;
    }
    let _projection = '4326';//空间坐标系
    if (defined(options.projection)) {
        _projection = options.projection;
    }
    let _mapType = null;//底图类型

    /**
     * 创建的leaflet的map
     */
    let _map = new L.map(target, {
        center: [_lat, _lon],
        zoom: _zoom
    });
    _map.addLayer(_imgLayer);

    this._map = _map;

    let lfom = new OnlineLFMap(_online);
    let _imgOmLayer = lfom.getLFMapImg();//默认返回谷歌影像图层

    var om = new OverviewMap(_map, _imgOmLayer);


    /**
     * 移除影像
     */
    function rLFMap() {
        if (_imgLayer) {
            _map.removeLayer(_imgLayer);
            _imgLayer = null;
        }
    }

    /**
     * 移除标注
     */
    function rLFLab() {
        if (_labLayer) {
            _map.removeLayer(_labLayer);
            _labLayer = null;
        }
    }


    /**
     * 设置底图
     * @param object{type:vec_c//天地图矢量底图}
     *             img_w天地图影像地图
     *             cva_w天地图矢量注记
     *             cia_w天地图影像注记
     *             默认是谷歌影像底图
     */
    this.setOnlineMap = function (object) {
        let type = null;
        if (object && object.type)
            type = object.type;
        switch (type) {
            case "vec_c"://天地图矢量底图
                rLFMap();
                rLFLab();
                _mapType = type;
                _imgLayer = lfm.getLFMapImg("vec_c");
                _map.addLayer(_imgLayer);
                _imgLayer.setZIndex(1);
                break;
            case "img_w"://天地图影像地图
                rLFMap();
                rLFLab();
                _mapType = type;
                _imgLayer = lfm.getLFMapImg("img_w");
                _map.addLayer(_imgLayer);
                _imgLayer.setZIndex(1);
                break;
            case "cva_w"://天地图矢量注记
                rLFLab();
                _labLayer = lfm.getLFMapImg("cva_w");
                _map.addLayer(_labLayer);
                _labLayer.setZIndex(2);

                break;
            case "cia_w"://天地图影像注记
                rLFLab();
                _labLayer = lfm.getLFMapImg("cia_w");
                _map.addLayer(_labLayer);
                _labLayer.setZIndex(2);
                break;
            default:
                rLFMap();
                rLFLab();
                _mapType = null;
                _imgLayer = lfm.getLFMapImg();
                _map.addLayer(_imgLayer);
                _imgLayer.setZIndex(1);
                break;
        }

    };

    /**
     * 设置地图中心和缩放级别
     * @param options {
     *                  lon:113,
     *                  lat:23,
     *                  zoom:10
     *                 }
     */
    this.setZoomAndCenter = function (options) {
        if (!defined(options)) {
            return;
        }
        if (defined(options.lon) && defined(options.lat)) {
            let p = _map.getView().getProjection();
            let v = _map.getView()
            if (p.getCode() === 'EPSG:3857') {
                let m_center = [options.lon, options.lat];//地图中心点-经纬度坐标
                m_center = ol.proj.transform(m_center, 'EPSG:4326', p.getCode());
                v.setCenter(m_center);
            } else if (p.getCode() === 'EPSG:4326') {
                v.setCenter([options.lon, options.lat]);
            }
        }
        if (defined(options.zoom)) {
            var v = _map.getView();
            v.setZoom(options.zoom);
        }
    };

    /**
     * 设置鹰眼
     * @param temp true/false
     */
    this.setOverviewMap = function (temp) {
        if (temp) {
            if (!_ovm) {
                _ovm = new OnlineMap(_online);
            }
            _ovmL = _ovm.getLFMapImg(_mapType);

            this.overviewmap = new ol.control.OverviewMap({
                layers: [_ovmL]
            });
            _map.addControl(this.overviewmap);
        } else {
            _map.removeControl(this.overviewmap);
        }

    };
    this.getLayers = function () {
        return _map._layers;
    };

}

Object.defineProperties(LFMap.prototype, {
    map: {
        get: function () {
            return this._map;
        }
    }
});
/**
 * 设置地图缩放最大最小级别
 * @param max
 * @param min
 */
LFMap.prototype.maxMinZoom = function (max, min) {
    this.view.setMaxZoom(max);
    this.view.setMinZoom(min);
};

export default LFMap;
