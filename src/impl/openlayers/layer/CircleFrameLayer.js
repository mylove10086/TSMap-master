import Styles from "../style/Styles";
import {createGuid} from "../interaction/createGid";

/**
 * Created by  on 2022/7/21.
 */
function CircleFrameLayer(map) {
    this.styleSet = new Styles();
    var style = this.styleSet.getStyle();
    var source = new ol.source.Vector({wrapX: false});
    var vector = new ol.layer.Vector({
        source: source
    });
    var metersPerUnit = map.getView().getProjection().getMetersPerUnit();
    map.addLayer(vector);
    var listfun = null;
    var collection = {};
    var _speed = 0.0;
    var color = ['rgba(49,229,214,0.0)', 'rgba(49,229,214,0.2)', 'rgba(49,229,214,0.8)', 'rgba(49,229,214,1)']

    var style1 = new ol.style.Style({
        renderer: function (coordinates, state) {
            const [[x, y], [x1, y1]] = coordinates;
            const ctx = state.context;
            const dx = x1 - x;
            const dy = y1 - y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            const innerRadius = 0;
            const outerRadius = radius * 1.4;
            const gradient = ctx.createRadialGradient(x, y, innerRadius, x,
                y, outerRadius);
            gradient.addColorStop(0, color[0]);
            gradient.addColorStop(0.6, color[1]);
            gradient.addColorStop(0.8, color[2]);
            gradient.addColorStop(0.99, color[3]);

            if (_speed > 0) {
                var step = state.feature.get("step");
                if (radius < step) {
                    step = 0;
                }
                var disNum = step + _speed / 1000;
                var t = radius / metersPerUnit * _speed * 100;
                state.feature.set("step", step + t);

                ctx.beginPath();
                ctx.arc(x, y, disNum, 0, 2 * Math.PI, true);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,0,0,0)';
                ctx.stroke(); // 进行绘制
            } else {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.strokeStyle = color[3];
                ctx.stroke(); // 进行绘制
            }


        }
    });

    this.speed = function (speed) {
        _speed = speed > 0 ? speed : 0.0;
        if (_speed > 0 && !listfun) {
            listfun = vector.on('postrender', (evt) => {
                map.render();
            });
        }
    }
    // 圆圈的数量
    this.count = function (count) {

    }

    this.addFeature = function (object) {
        if (!object) {
            return;
        }
        object = object instanceof Array ? object : [object];
        for (var i = 0; i < object.length; i++) {
            var item = object[i];

            var attr = item.properties ? item.properties : {};
            var id = attr.gid ? attr.gid : "Cesium.createGuid()";
            if (collection[id]) {
            } else {
                var geometry = item.geometry ? item.geometry : {};
                var coor = geometry.coordinates;
                var radius = geometry.radius ? parseFloat(geometry.radius) : 500;
                radius = (radius / metersPerUnit)
                var cricle = new ol.geom.Circle([coor[0], coor[1]], radius);
                var feature = new ol.Feature({
                    geometry: cricle
                });
                feature.setStyle(style1);
                feature.set("step", 0);
                source.addFeature(feature);
                var point = new ol.Feature({
                    geometry: new ol.geom.Point([coor[0], coor[1]])
                });
                source.addFeature(point);
                for (var int in attr) {
                    point.set(int, attr[int]);
                }
                var id = null;
                if (attr && attr.gid) {
                    id = attr.gid;
                } else {
                    id = createGuid();
                }
                point.set("gid", id);
                point.setId(id);

                collection[id] = {
                    feature: feature,
                    point: point,
                    geometry: cricle,
                };
            }
        }
        if (_speed > 0 && !listfun) {
            listfun = vector.on('postrender', (evt) => {
                map.render();
            });
        }
    }
    this.addFeatures = this.addFeature;

    this.setStyle = function (options) {
        //var style = this.styleSet.getStyle(options);
        //vector.setStyle(style)
        /*style = this.styleSet.getStyle(options);
        vector.setStyle(style);*/
        if (!this.styleSet) {
            this.styleSet = new Styles();
        }
        this.styleSet.vectorLayer = vector;
        this.styleSet.setStyle(options);

        var rr = options.fill.split('(');
        if (rr.length === 2) {
            var index = rr[1].split(',');
            var str;
            if (index.length === 3) {
                var s = index[3].split(")");
                str = "rgba(" + index[0] + "," + index[1] + "," + s[0];
            } else if (index.length === 4) {
                str = "rgba(" + index[0] + "," + index[1] + "," + index[2];
            }
            color = [str + ",0.0)", str + ",0.2)", str + ",0.8)", str + ",1.0)"]

        } else {
            color = ['rgba(49,229,214,0.0)', 'rgba(49,229,214,0.2)', 'rgba(49,229,214,0.8)', 'rgba(49,229,214,1)']

        }
        if (options.distance) {
            vector._distance = options.distance;
        }
        if (!options) {
            vector._distance = null;
        }

    }
    this.setVisible = function (visible) {
        vector.setVisible(visible);
    };
    this.getVisible = function () {
        return vector.getVisible()
    };
    /**
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    this.getFeatureById = function (id) {
        return source.getFeatureById(id);
    }
    this.length = function () {
        return source.length();
    }
    /**
     * 移除图层
     */
    this.removeLayer = function () {
        map.removeLayer(vector);
    }
    /**
     * 重新添加地图
     */
    this.addLayer = function () {
        this.removeLayer();
        map.addLayer(vector);
    }
    this.clear = function () {
        source.clear();
        collection = {};
        if (listfun) {
            vector.un('postrender', listfun.listener);
            listfun = null;
        }
    };
    this.contains = function (feature) {
        return false;
    }
    this.removeFeature = function (id) {
        var item = collection[id];
        if (item) {
            source.removeFeature(item.feature);
            source.removeFeature(item.point);
            delete collection[id];
        }
    }
    this.showById = function (id) {
        var item = collection[id];
        if (item) {
            if (item.show) {
                source.removeFeature(item.feature);
                source.removeFeature(item.point);
                item.show = false;
            } else {
                item.show = true;
                source.addFeature(item.feature);
                source.addFeature(item.point);
            }
        }
    }
    this.getFeatureById = function (id) {
    }
    /**
     * 0 移动到最底层
     * 1 上移一层
     * 2 移动到最顶层
     * -1 下移一层
     * @param index
     */
    this.setZIndex = function (index) {
        var z = vector.getZIndex();
        switch (index) {
            case 0:
                vector.setZIndex(0);
                break;
            case 2:
                z = map.getLayers().getLength();
                vector.setZIndex(z - 1);
                break;
            case -1:
                z = z - 1;
                if (z <= 0) {
                    z = 0;
                }
                vector.setZIndex(z);
                break;
            default:

                vector.setZIndex(z + 1);

                break;

        }
    }

}

export default CircleFrameLayer;
