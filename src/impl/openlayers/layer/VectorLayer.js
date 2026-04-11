/**
 * 创建一个要素图层
 */
import {extend, hasUndefined} from "../../../common/util";
import Styles from "../style/Styles";
import {createGuid} from "../interaction/createGid";

class VectorLayer {

    constructor(map, options) {
        this.map = map;
        options = options ? options : {};
        this._id = options.id;
        if (hasUndefined(this.map)) {
            return;
        }
        this._removefun = null;
        this._clickCallback = null;
        this.sourceVector = new ol.source.Vector({wrapX: false});

        this.vectorLayer = new ol.layer.Vector({
            source: this.sourceVector,
        });
        this.oluid = this.vectorLayer.ol_uid;

        this.map.addLayer(this.vectorLayer);
    }

    /**
     * 获取创建的矢量源
     * @returns {*}
     */
    getSourceVector() {
        return this.sourceVector;
    }

    /**
     * 清除所有要素
     */
    clearFeature() {
        this.sourceVector.clear();
    }


    addFeature(object) {

        let g = this.createFeature(object);
        if (g) {
            this.coordinates = g.getGeometry().getCoordinates();
            this.sourceVector.addFeature(g);

        }
        return g;
    }

    /**
     * 数组对象c
     */
    addFeatures(object) {
        let features = [];
        for (let i = 0; i < object.length; i++) {
            let item = object[i];
            let g = this.createFeature(item);
            features.push(g);
        }
        this.sourceVector.addFeatures(features);
    }

    createFeature(item) {
        let geometry = item.geometry ? item.geometry : null,
            coords = geometry ? geometry.coordinates : null;
        if (!coords && !geometry) {
            return null;
        }
        let attr = null;

        let gid = null;
        if (item && item.properties) {
            attr = item.properties;
            gid = item.properties.gid;
        }
        let radius = 100;

        if (geometry.radius) {
            radius = geometry.radius;
        }
        let type = geometry.type;
        let g = null;
        if (gid) {
            g = this.getFeatureById(gid);
        }
        let p = null;
        switch (type) {
            case 'Point':
                p = new ol.geom.Point(coords);
                break;
            case 'LineString':
                p = new ol.geom.LineString(coords);
                break;
            case 'Polygon':
                p = new ol.geom.Polygon([coords]);

                break;
            case 'MultiPolygon':
                p = new ol.geom.MultiPolygon(coords);
                break;
            case 'RadiusCircle':
                let circleIn3857 = new ol.geom.Circle(ol.proj.transform(coords, this.map.getView().getProjection(), 'EPSG:3857'), radius, 'XY');
                let circleIn4326 = circleIn3857.transform('EPSG:3857', this.map.getView().getProjection());
                p = new ol.geom.Polygon.fromCircle(circleIn4326, 360, 0);
                break;
        }
        if (p) {
            if (g) {
                g.setGeometry(p);
            } else {
                g = new ol.Feature({
                    geometry: p
                });
            }
        }
        if (g) {
            for (var int in attr) {
                g.set(int, attr[int]);
            }
            if (gid) {
                g.setId(gid);
            } else
                g.setId(createGuid());
        }
        g.set("name", this._id);
        return g;
    }

    getFeatureById(id) {
        return this.sourceVector.getFeatureById(id);
    }

    length() {
        if (this.sourceVector)
            return this.sourceVector.getFeatures().length;
        return 0;
    }

    removeFeature(feature) {
        if (feature instanceof ol.Feature) {
            this.sourceVector.removeFeature(feature);
        } else {
            let featur = this.getFeatureById(feature);
            if (featur)
                this.sourceVector.removeFeature(featur);
        }
    }
    removeLayer() {
        this.removeClick();
        this.moveClick();

        this.map.removeLayer(this.vectorLayer);
        if (this.sourceVector) {
            this.sourceVector.clear();
            this.sourceVector = null;
        }

        this.vectorLayer = null;
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
     * 设置图层的样式
     * @param style openlayer的样式对象
     */
    setStyle(style) {
        if (style) {
            if (this.vectorLayer) {
                if (!this.defaultStyle) {
                    this.defaultStyle = new Styles();
                }
                this.vectorLayer.setStyle(this.defaultStyle.setStyle(style));
            }
            if (style.distance && this.vectorLayer) {
                this.vectorLayer._distance = style.distance;
            }
        } else {
            if (this.vectorLayer) {
                this.vectorLayer._distance = null;
            }
        }

    };

    refresh() {
        //this.sourceVector.refresh();
    }

    changed() {
        this.sourceVector.changed();
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
        return this.sourceVector.hasFeature(feature);
    }

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

export default VectorLayer;
