/**
 * Created by  on 2022/5/7.
 */
import Styles from "../style/Styles";

function HighlightedLayer(id) {
    this.key = "gid";
    this.type = "simple";
    this._layer = null;
    this.style = new Styles();
    let featrues = {};

    let obj = {
        //url: 'img/zy.png',//图片url
        scale: 1.0,
        fill: 'rgba(108,229,211,0.8)',//填充颜色
        width: 2,//线宽
        anchor: [0.0, 0.0],
        radius: 3,//圆半径
        color: '#da2de7'//线颜色
    };
    var color = this.style.getStyle(obj);
    let callback = null;

    function remaveColor(name) {
        featrues[name].feature.setStyle(featrues[name].originalColor);
        delete featrues[name];
    }

    function removef(name) {
        var hightfeature = featrues[name];
        if (hightfeature) {
            remaveColor(name);
            if (callback) {
                var obj = {
                    key: name,
                    type: "mapRemave"
                }
                callback(obj);
            }
        }
    }

    function addColor(feature) {
        var hight = {
            feature: feature,
            originalColor: null
        };
        var ft = feature.getGeometry();
        var tp = ft.getType();
        var style = feature.getStyle();
        if (style) {
            hight.originalColor = style;
        } else {
            feature.setStyle(color);
        }

        return hight;
    }

    function addf(feature, name) {
        if (feature) {
            featrues[name] = addColor(feature);
            if (callback) {
                var obj = {
                    key: name,
                    type: "mapAdd"
                }
                callback(obj);
            }
        }
    }

    this.addFeature = function (object) {
        if (this._layer) {
            if(feature){
                var bol;
                var f = null;
                if (typeof feature === 'string') {
                    f = this._layer.getFeatureById(feature);
                } else {
                    bol = this._layer.contains(feature);
                }
                if (bol || f) {
                    if (f) {
                        feature = f;
                    }
                    var name = null;
                    if (feature.attribute) {
                        name = feature.attribute[this.key];
                    }
                    if (!name) {
                        name = feature._id;
                    }
                    var hightfeature = featrues[name];
                    if (hightfeature) {
                        removef(name);
                    } else {
                        addf(feature, name);
                    }
                }
            }
        } else {
            switch (this.type) {
                case "simple":
                    if (feature) {
                        var name = null;
                        if (feature.attribute) {
                            name = feature.attribute[this.key];
                        }
                        if (!name) {
                            name = feature._id;
                        }
                        var hightfeature = featrues[name];
                        if (hightfeature) {
                            removef(name);
                        } else {
                            this.clear();
                            addf(feature, name);
                        }
                    } else {
                        this.clear();
                    }
                    break

            }
        }
    };
    this.addFeatures = function (object) {
        if (object && object.feature) {
            var name = "key";
            if (object.key) {
                name = object.key;
            }
            var hightfeature = featrues[name];
            if (hightfeature && object.feature == hightfeature.feature) {
                return
            }
            if (!hightfeature || object.feature != hightfeature.feature) {
                addf(object.feature, name);
            }
        } else if (object.key) {
            removef(object.key);
        }

    }
    this.removeFeature = function (key) {
        if (typeof key === "string") {
            var hightfeature = featrues[key];
            if (hightfeature) {
                remaveColor(key);
                var obj = {
                    key: key,
                    type: "remave"
                }
                callback(obj);
            }
        } else {

        }

    }
    this.clear = function () {
        for (var index in featrues) {
            remaveColor(index, false);
            delete featrues[index];
        }
    }
    this.setStyle = function (cc) {
        color = this.style.getStyle(cc);

    }
    this.setCallback = function (fun) {
        callback = fun;
    }
}

