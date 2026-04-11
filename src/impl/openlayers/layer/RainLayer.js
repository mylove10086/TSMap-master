/**
 * 降雨预报
 * @param map
 * @constructor
 */
import PopupsRight from "../overlay/PopupsRight";
import {isDefined} from "../../../common/util";

class RainLayer {
    constructor(map, options) {
        if (!isDefined(map))
            return;
        this.sources = new ol.source.Vector();
        this.map = map;
        this._removefun = null;
        this._clickCallback = null;
        this.pStyle = {};
        this.pStyle["symbol5"] = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(164,245,140,0.5)'
            })
        });
        this.pStyle["symbol15"] = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(58,164,2,0.5)'
            })
        });
        this.pStyle["symbol25"] = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(47,123,232,0.5)'
            })
        });
        let that = this;
        this.vectorLayer = new ol.layer.Vector({
            source: this.sources
        });
        this.map = map;
        map.addLayer(this.vectorLayer);
        let popups = new PopupsRight(map);
        map.on('pointermove', function (e) {

            let pixel = map.getEventPixel(e.originalEvent);
            let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });
            if (feature) {
                if (feature.get("rltype") === "polygon") {
                    let coordinate = e.coordinate;
                    let level = null;
                    if (feature.get("level") <= 5) {
                        level = "小雨";
                    } else if (feature.get("level") <= 15) {
                        level = "中雨";
                    } else if (feature.get("level") <= 25) {
                        level = "大雨";
                    } else {
                        level = "小雨";
                    }
                    popups.setPosition(coordinate, "", level);
                } else {
                    popups.setPosition(undefined, "", "");
                }
            } else {
                popups.setPosition(undefined, "", "");
            }

        });

        this.getStyle = function (level) {
            if (level <= 5) {
                return that.pStyle["symbol5"];
            } else if (level <= 15) {
                return that.pStyle["symbol15"];
            } else if (level <= 25) {
                return that.pStyle["symbol25"];
            } else {
                return that.pStyle["symbol5"];
            }

        }
    }

    /**
     * 设置图层的可见性
     * @param object {visible:true/false}
     */
    setVisible(object) {
        this.vectorLayer.setVisible(visible);
    };

    getVisible() {
        return this.vectorLayer.getVisible();
    };

    /**
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    getFeatureById(id) {
        if (this.sources)
            return this.sources.getFeatureById(id);
        return null
    }

    length() {
        if (this.sources)
            return this.sources.getFeatures().length;
        return 0;
    }

    /**
     * 移除图层
     */
    removeLayer() {
        this.removeClick();
        this.moveClick();

        this.map.removeLayer(this.vectorLayer);
    };

    /**
     * 清空数据
     */
    clearFeature() {
        this.sources.clear();
    };

    /**
     * 重新添加地图
     */
    addLayer() {
        if (this.vectorLayer) {
            this.map.addLayer(this.vectorLayer);
        }
    };


    /**
     * 添加降雨
     * @param object
     */
    addRain(object) {
        this.sources.clear();
        for (let i = 0; i < object.length; i++) {
            let item = object[i];
            let latAndLong = item.latAndLong;
            let ll = [];
            for (let t = 0; t < latAndLong.length; t++) {
                let titem = latAndLong[t];
                ll.push([titem[1], titem[0]]);
            }
            let p = new ol.geom.Polygon([ll]);
            let f = new ol.Feature({
                geometry: p
            });
            f.set("level", item.symbol);
            f.set("rltype", "polygon");

            f.setStyle(this.getStyle(item.symbol));
            this.sources.addFeature(f);
        }
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
        return this.sources.hasFeature(feature);
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

export default RainLayer;
