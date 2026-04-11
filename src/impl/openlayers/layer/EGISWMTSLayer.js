import {extend, hasUndefined} from "../../../common/util";

/**
 * 矢量切片
 * @param map 初始化的map
 * @param object {
 *                 url:'',//图层url
 *                 layer:''//图层名称
 *                 epsg:4326//图层空间坐标系
 *                 origin:[-180,90],
 *                 version:"1.0.0"
 *                }
 *
 */
class EGISWMTSLayer {
    constructor(map, object) {

        if (hasUndefined(map)) {
            return;

        }
        if (hasUndefined(object)) {
            return;
        }
        this.map = map;

        this.url;
        if (object.url) {
            this.url = object.url;
        } else {
            return;
        }
        this.layer;
        if (object.layer) {
            this.layer = object.layer;
        } else {
            return;
        }
        this.resolutions = [1.40625,
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
        this.version = "1.0.0";
        if (object.version) {
            this.version = object.version;
        }
        this.epsg = 'EPSG:4326';
        if (object.epsg) {
            this.epsg = 'EPSG:' + object.epsg;
        }
        this.origin = [
            -180,
            90
        ];
        if (object.origin) {
            this.origin = object.origin;
        }
        this.tilegrid = new ol.tilegrid.TileGrid({
            origin: this.origin,    // 设置原点坐标
            resolutions: this.resolutions    // 设置分辨率
        });
        let that = this;
        // 创建百度地图的数据源
        this.baiduSource = new ol.source.TileImage({
            projection: this.epsg,
            tileGrid: this.tilegrid,
            tileUrlFunction: function (tileCoord, pixelRatio, proj) {
                //var z = tileCoord[0];
                //var x = tileCoord[1];
                //ivar y = tileCoord[2];
                //http://19.15.70.147:18091/maps-webapp/geography/egis?layer=img_vec_c&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix=8&TileCol=206&TileRow=47
                //var vec_c_url = "http://19.15.70.147:18091/maps-webapp/geography/egis?layer=vec_c&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix=" + z + "&TileCol=" + x + "&TileRow=" + y;
                let vec_c_url = that.url + "?layer=" + that.layer + "&tilematrixset=c&Service=WMTS&Request=GetTile&Version=" + that.version + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];
                //let vec_c_url = that.url + "?layer=" + that.layer + "&tilematrixset=c&Service=WMTS&Version=" + that.version + "&Format=tiles&TileMatrix=" + tileCoord[0] + "&TileCol=" + tileCoord[1] + "&TileRow=" + tileCoord[2];
                return vec_c_url;
            }
        });
        this.layerTile = new ol.layer.Tile({
            source: this.baiduSource
        });
        map.addLayer(this.layerTile);
    }

    /**
     * 移除地图
     */
    removeLayer() {
        if (this.layerTile) {
            this.map.removeLayer(this.layerTile)
        }
    }

    /**
     * 重新添加地图
     */

    addLayer() {
        if (this.layerTile) {
            this.map.addLayer(this.layerTile);
        }
    }

    /**
     * 获取图层的可见性
     * @returns {true/false}
     */

    getVisible() {
        return this.layerTile.getVisible();
    }

    /**
     * 设置图层的可见性
     * @param object {visible:true/false}
     */

    setVisible(object) {
        this.layerTile.setVisible(visible);
    }
    setZIndex(index) {

    }
}

export default EGISWMTSLayer;

