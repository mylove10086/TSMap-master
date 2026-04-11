import {extend, hasUndefined} from "../../../common/util";
import {DefaultOptions} from "../../../map/TsMapConstants";

/**
 * 矢量切片
 * @param map 初始化的map
 * @param object {
 *                 url:'',//图层url
 *                 layers:''//图层名称
 *                 featureNS:''//图层空间标识符
 *                 featurePrefix:''//图层命名空间
 *                 label:"addr",//显示标签的字段
 *                 minZoom:12,//最小的显示比例尺
 *                 epsg:4326//图层空间坐标系
 *                }
 *
 */
class WmtsLayer {

    constructor(map, options) {
        this.map = map;
        this.options = extend(this.getDefaultOptions(), options);

        if (hasUndefined(this.map, this.options.url, this.options.layer)) {
            return;
        }

        let gridsetName = 'EPSG:4326';
        let gridNames = ['EPSG:4326:0', 'EPSG:4326:1', 'EPSG:4326:2', 'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6', 'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10', 'EPSG:4326:11', 'EPSG:4326:12', 'EPSG:4326:13', 'EPSG:4326:14', 'EPSG:4326:15', 'EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18', 'EPSG:4326:19', 'EPSG:4326:20', 'EPSG:4326:21'];
        this.resolutions = [0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4, 8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5, 1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6, 1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7];

        this.params = {
            'VERSION': '1.0.0',
            'LAYER': this.options.layer,
            'STYLE': '',
            'TILEMATRIX': gridNames,
            'TILEMATRIXSET': gridsetName,
            'SERVICE': 'WMTS',
            'FORMAT': 'image/png'
        };

        this.projection = this.map.getView().getProjection();
        this.baseParams = ['VERSION', 'LAYER', 'STYLE', 'TILEMATRIX', 'TILEMATRIXSET', 'SERVICE', 'FORMAT'];

        this.layer = new ol.layer.Tile({
            source: this.constructSource(this.options.url, this.params)
        });

        this.map.addLayer(this.layer);
    }

    getDefaultOptions() {
        return {
            geom: DefaultOptions.GEOM,
            projection: DefaultOptions.PROJECTION
        };
    }

    constructSource(baseUrl, params) {
        let url = baseUrl + '?';

        for (let param in params) {
            if (this.baseParams.indexOf(param.toUpperCase()) < 0) {
                url = url + param + '=' + params[param] + '&';
            }
        }

        return new ol.source.WMTS({
            url: url.slice(0, -1),
            layer: this.params['LAYER'],
            matrixSet: this.params['TILEMATRIXSET'],
            format: this.params['FORMAT'],
            projection: this.projection,
            tileGrid: new ol.tilegrid.WMTS({
                tileSize: [256, 256],
                extent: [-180.0, -90.0, 180.0, 90.0],
                origin: [-180.0, 90.0],
                resolutions: this.resolutions,
                matrixIds: this.params['TILEMATRIX']
            }),
            style: this.params['STYLE'],
            wrapX: true
        });
    }

    /**
     * 移除图层
     */
    removeLayer() {
        if (this.layer) {
            this.map.removeLayer(this.layer)
        }
    };

    /**
     * 重新添加图层
     */
    addLayer() {
        if (this.layer) {
            this.map.addLayer(this.layer)
        }
    };

    /**
     * 获取图层的可见性
     * @returns {true/false}
     */
    getVisible() {
        return this.layer.getVisible()
    };

    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    setVisible(visible) {
        this.layer.setVisible(visible);
    };
    setZIndex(index) {

    }
}

export default WmtsLayer;

