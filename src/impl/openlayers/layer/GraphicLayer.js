/**
 * 创建一个加载geojson数据的图层
 * @param map openlayer的创建的地图map
 * @param object {url:''geojson的地址}
 * @constructor
 */
import Styles from "../style/Styles";
import {extend, hasUndefined} from "../../../common/util";
import SourceVector from "../common/SourceVector";
import ClusterLayer from "./ClusterLayer";

class GraphicLayer {

    constructor(map, options) {
        options = options ? options : {};
        this._id = options.id;
        this.map = map;
        this.options = extend({}, options);
        this._removefun = null;
        this._clickCallback = null;
        this._removefun1 = null;
        this._clickCallback1 = null;
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
    }

    /**
     * 通过坐标进行空间查询的
     * @param object {coordinate:[[经度,纬度]]//长度大于等于3}
     */
    spatialQueryFromPolygon(object) {
        /*if (object && object.coordinate.length > 3) {
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
        }*/
        return this.vectorSource.spatialQueryFromPolygon(object);
    };

    addFeature(object) {
        if (this.clusterLayer) {
            this.clusterLayer.clusterSource.resolution = undefined;
        }
        var feature = this.vectorSource.addFeature(object, this);
        return feature;

    };

    addFeatures(object) {
        if (this.clusterLayer) {
            this.clusterLayer.clusterSource.resolution = undefined;
        }
        this.vectorSource.addFeatures(object, this);

    };

    getCoordinates() {
        return this.coordinates;
    };

    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    setVisible(visible) {
        this.vectorLayer.setVisible(visible);
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
        this.cluster(false);
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
        this.vectorSource.clear();
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
        if (this.clusterLayer) {
            this.clusterLayer.setStyle(options);
        }
    }

    cluster(bol) {
        if (!this.clusterLayer && bol) {
            this.clusterLayer = new ClusterLayer(this.map, {source: this.vectorSource});
            /*const features = this.vectorSource.getFeatures();
            for (let i = 0; i < features.length; i++) {
                let item = features[i];
                let type = item.getGeometry().getType();
                if (type === "Point") {
                    let p = item.getGeometry().getCoordinates();
                    var gid = item.get("gid");
                    let graphic = {
                        "geometry": {
                            "type": "Point",
                            "coordinates": p
                        }, properties: {
                            gid: gid
                        }
                    };
                    this.clusterLayer.addFeature(graphic);
                }
            }*/
            this.vectorLayer.setVisible(false);
        } else {
            if (this.clusterLayer) {
                this.clusterLayer.removeLayer();
            }
            this.clusterLayer = null;
            this.vectorLayer.setVisible(true);
        }
    }

}

export default GraphicLayer;

