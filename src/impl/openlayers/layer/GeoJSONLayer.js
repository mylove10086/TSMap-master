/**
 * 创建一个加载geojson数据的图层
 * @param map openlayer的创建的地图map
 * @param object {url:''geojson的地址}
 * @constructor
 */
import {extend, hasUndefined, isDefined} from "../../../common/util";
import Styles from "../style/Styles";
import insidePolygon from "../common/InsidePolygon";
import GraphicLayer from "./GraphicLayer";


class GeoJSONLayer {

    constructor(map, options) {
        options = options ? options : {};
        this._id = options.id;
        this.map = map;
        this.options = extend({}, options);

        if (hasUndefined(this.map)) {
            return;
        }

        if (this.options.url) {
            this.vectorSource = new ol.source.Vector({
                url: this.options.url,
                format: new ol.format.GeoJSON(),
            });

            this.vectorLayer = new ol.layer.Vector({
                source: this.vectorSource
            });
            this.oluid = this.vectorLayer.ol_uid;

            this.map.addLayer(this.vectorLayer);
            let zindex = map.getLayers().getLength();
            this.vectorLayer.setZIndex(zindex);
        }
        this.featureCollection = [];
        this.style = {};

        this.graphiclayer = null;

    }

    clear() {
        if (this.vectorLayer)
            this.vectorSource.clear();
        if (this.graphiclayer)
            this.graphiclayer.clear();
    }

    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    setVisible(visible) {
        if (this.vectorLayer)
            this.vectorLayer.setVisible(visible);
        if (this.graphiclayer)
            this.graphiclayer.setVisible(visible);
    };

    getVisible() {
        if (this.vectorLayer)
            return this.vectorLayer.getVisible();
        return false;
    };

    /**
     * 添加geojson要素
     *
     * @param object {url:''}
     */
    setDataSource(object) {
        if (object && object.url) {
            this.removeLayer();
            this.options.url = object.url;

            this.vectorSource = new ol.source.Vector({
                url: this.options.url,
                format: new ol.format.GeoJSON(),
            });

            this.vectorLayer = new ol.layer.Vector({
                source: this.vectorSource
            });

            this.map.addLayer(this.vectorLayer);
            let zindex = map.getLayers().getLength();
            this.vectorLayer.setZIndex(zindex);
            this.setStyle(this.style);
        }
    };


    addFeature(object) {
        if (!this.graphiclayer) {
            this.graphiclayer = new GraphicLayer(this.map);
            this.graphiclayer.setStyle(this.style);
        }
        var array = [];
        for (var i = 0; i<object.features.length; i++) {
            var item = object.features[i];
            if(item.geometry.type=="Polygon"){
                item.geometry.coordinates=   item.geometry.coordinates[0];

            }
            array.push(item);
        }

        this.graphiclayer.addFeatures(object.features);

    }

    /**
     * 通过坐标进行空间查询的
     * @param object {coordinate:[[经度,纬度]]//长度大于等于3}
     */
    spatialQueryFromPolygon(object) {
        if (object && object.coordinate.length > 3) {
            if (this.featureCollection.length === 0) {
                this.featureCollection = this.vectorSource.getFeatures();
            }
            this.clear();
            let collect = [];
            for (let i = 0; i < this.featureCollection.length; i++) {
                let item = this.featureCollection[i];
                let p = item.getGeometry().getCoordinates();
                let bol = insidePolygon(object.coordinate, p);
                if (bol) {
                    //this.vectorSource.addFeature(this.featureCollection[i]);
                    collect.push(item);
                }
            }
            this.vectorSource.addFeatures(collect);
        } else {
            if (this.featureCollection.length > 0) {
                this.clear();
                this.vectorSource.addFeatures(this.featureCollection);
            }
        }
    };

    /**
     * 移除图层,移除后需要用 setDataSource从新添加
     */
    removeLayer() {
        this.removeClick();
        this.moveClick();
        this.map.removeLayer(this.vectorLayer);

        if (this.vectorSource) {
            this.vectorSource.clear();
            this.vectorSource = null;
        }

        this.vectorLayer = null;
        this.options.url = null;
        if (this.graphiclayer) {
            this.graphiclayer.removeLayer();
            this.graphiclayer = null;
        }
    };

    /**
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    getFeatureById(id) {
        if (this.vectorSource)
            return this.vectorSource.getFeatureById(id);
        if (this.graphiclayer)
            return this.graphiclayer.getFeatureById(id);
        return null
    }

    length() {
        if (this.vectorSource)
            return this.vectorSource.getFeatures().length;
        return 0;
    }

    /**
     * 添加图层
     */
    addLayer() {
        if (this.vectorLayer) {
            this.map.removeLayer(this.vectorLayer);
        }
        this.vectorLayer = new ol.layer.Vector({
            source: this.vectorSource
        });
        this.map.addLayer(this.vectorLayer);
        let zindex = map.getLayers().getLength();
        this.vectorLayer.setZIndex(zindex);
    }

    /**
     * 设置图层的样式
     * @param opt_style openlayer的样式对象
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
        if (!this.styleSet) {
            this.styleSet = new Styles();
        }

        this.styleSet.vectorLayer = this.vectorLayer;
        this.styleSet.setStyle(style);
        this.style = style;
        if (style) {
            if (style.distance && this.vectorLayer) {
                this.vectorLayer._distance = style.distance;
            }
        } else {
            if (this.vectorLayer) {
                this.vectorLayer._distance = null;
            }
        }
        if (this.graphiclayer)
            this.graphiclayer.setStyle(style);
    };

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
            if (this.graphiclayer)
                this.graphiclayer.setClickCallback(fun);
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
            if (this.graphiclayer)
                this.graphiclayer.setMoveCallback(fun);
        }
    }

    contains(feature) {
        if (this.vectorSource)
            return this.vectorSource.hasFeature(feature);
        else
            return false;
    }

    /**
     * 0 移动到最底层
     * 1 上移一层
     * 2 移动到最顶层
     * -1 下移一层
     * @param index
     */
    setZIndex(index) {
        if (this.vectorLayer) {
            var z = this.vectorLayer.getZIndex();
            switch (index) {
                case 0:
                    this.vectorLayer.setZIndex(0);
                    break;
                case 2:
                    z = this.map.getLayers().getLength();
                    this.vectorLayer.setZIndex(z - 1);
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
    }

}

export default GeoJSONLayer;
