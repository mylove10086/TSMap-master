import insidePolygon from "./InsidePolygon";

/**
 * 图层的要素添加查询
 */
class SourceVector {
    constructor(map, id) {
        this._name = id;

        this.sourceVector = new ol.source.Vector({wrapX: false});
        this.coordinates = null;
        this.featureCollection = [];
        this.map = map;
    }


    /**
     * 通过坐标进行空间查询的
     * @param object {coordinate:[[经度,纬度]]//长度大于等于3}
     */
    spatialQueryFromPolygon(object) {
        let ret = [];
        if (object && object.coordinate.length > 3) {
            if (this.featureCollection.length === 0) {
                this.featureCollection = this.sourceVector.getFeatures();
            }
            this.clear();
            let collect = [];
            for (let i = 0; i < this.featureCollection.length; i++) {
                let item = this.featureCollection[i];
                let p = item.getGeometry().getCoordinates();
                let bol = insidePolygon(object.coordinate, p);
                if (bol) {
                    collect.push(item);
                    let geo = {
                        geometry: {
                            "type": "Point",
                            "coordinates": p
                        },
                        properties: item.values_
                    };
                    ret.push(geo);
                }
            }
            this.sourceVector.addFeatures(collect);
        } else {
            if (this.featureCollection.length > 0) {
                this.clear();
                this.sourceVector.addFeatures(this.featureCollection);

            }
        }
        return ret
    }

    addFeature(object, layer) {
        let g = null;
        if (object && object.properties) {
            g = this.getFeatureById(object.properties.gid);
        }
        if (!g) {
            g = this.createFeature(object, this._name);
            if (g) {
                this.coordinates = g.getGeometry().getCoordinates();
                this.sourceVector.addFeature(g);
            }
        }
        g._layer = layer;
        return g;
    }

    /**
     * 数组对象c
     */
    addFeatures(object, layer) {
        let features = [];
        for (let i = 0; i < object.length; i++) {
            let item = object[i];
            let g = null;
            if (item && item.properties) {
                g = this.getFeatureById(item.properties.gid);
            }
            if (!g) {
                g = this.createFeature(item, this._name);
                features.push(g);
            }
            if (g) {
                g._layer = layer;
            }
        }
        this.sourceVector.addFeatures(features);

    }

    getFeatures() {
        return this.sourceVector.getFeatures();
    }

    removeFeature(feature) {
        if (feature instanceof ol.Feature) {
            this.sourceVector.removeFeature(feature);
        } else {
            let featur = this.getFeatureById(feature);
            this.sourceVector.removeFeature(featur);
        }

    }

    getFeatureById(id) {
        var ids = id ? id : "";
        let feature = this.sourceVector.getFeatureById(ids);
        return feature;
    }

    length() {
        return this.sourceVector.getFeatures().length;
    }

    /**
     * 清空图层
     */
    clear() {
        this.sourceVector.clear();
    }

    createFeature(item, id) {
       return SourceVector.createFeature(item, id);
    }

    /**
     * 判断要素在图层中
     * @param feature
     * @returns {boolean}
     */
    hasFeature(feature) {
        return this.sourceVector.hasFeature(feature);
    }

}

function createGuid() {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
SourceVector.createFeature=function (item) {
    let geometry = item.geometry ? item.geometry : null,
        coords = geometry ? geometry.coordinates : null;
    if (!coords && !geometry) {
        return null;
    }
    let attr = null;
    if (item && item.properties) {
        attr = item.properties;
    }
    let radius = 100;

    if (geometry.radius) {
        radius = geometry.radius;
    }
    let type = geometry.type;

    let g = null;
    switch (type) {
        case 'Point':
            let p = new ol.geom.Point(coords);
            g = new ol.Feature({
                name: id,
                geometry: p
            });
            break;
        case 'LineString':
            let route = new ol.geom.LineString(coords);
            g = new ol.Feature({
                name: id,
                geometry: route
            });
            break;
        case 'Polygon':

            let polygon = new ol.geom.Polygon([coords]);
            g = new ol.Feature({
                name: id,
                geometry: polygon
            });
            break;
        case 'MultiPolygon':
            let MultiPolygon = new ol.geom.MultiPolygon(coords);
            g = new ol.Feature({
                name: id,
                geometry: MultiPolygon
            });
            break;
        case 'RadiusCircle':
            let circleIn3857 = new ol.geom.Circle(ol.proj.transform(coords, this.map.getView().getProjection(), 'EPSG:3857'), radius, 'XY');
            let circleIn4326 = circleIn3857.transform('EPSG:3857', this.map.getView().getProjection());
            let circle4326 = new ol.geom.Polygon.fromCircle(circleIn4326, 360, 0);
            //let RadiusCircle = new ol.geom.Polygon(circle4326);
            g = new ol.Feature({
                name: id,
                geometry: circle4326
            });
            break;
    }
    if (g) {
        for (var int in attr) {
            g.set(int, attr[int]);
        }
        var id = null;
        if (attr && attr.gid) {
            id = attr.gid;
        } else {
            id = createGuid();
        }
        g.set("gid", id);
        g.setId(id);
    }
    return g;
}

export default SourceVector;
