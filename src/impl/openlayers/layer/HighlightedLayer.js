import Styles from "../style/Styles";


var highlight = {};

function degreetoradian(degree) {
    return degree * (Math.PI / 180);  // 转换为弧度
}

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
        //anchor: [0.0, 0.0],
        radius: 3,//圆半径
        color: '#da2de7'//线颜色
    };
    this.style = new Styles();
    this.hcolor = "#da2de7";

    var color = this.style.getStyle(obj, obj.color);
    let callback = null;

    let that = this;

    function remaveColor(name) {
        featrues[name].feature.setStyle(featrues[name].originalColor);
        delete featrues[name];
    }

    function removef(name) {
        var hightfeature = featrues[name];
        if (hightfeature) {
            remaveColor(name);
            if (callback) {
                var attr = hightfeature.feature.getKeys();
                var properties = {};
                for (let i = 0; i < attr.length; i++) {
                    let item = attr[i];
                    if (item !== 'geometry')
                        properties[item] = hightfeature.feature.get(item);
                }
                var obj = {
                    attribute: properties,
                    feature: hightfeature.feature,
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
        //pof.setStyle(styleLine);

        if (style) {
            hight.originalColor = style;
        }
        if (feature._layer && feature._layer._style && tp == "Point") {

            var cc = that.style.getHighStyle(feature._layer._style, feature, that.hcolor);
            //有些点会旋转方向
            if (feature.getGeometry().getType() === 'Point' && feature._layer._style.rotationlabel) {
                let rotation = feature.get(feature._layer._style.rotationlabel);
                if (rotation) {
                    var image = cc.getImage();
                    var ro = degreetoradian(rotation)
                    image.setRotation(ro);
                }
            }
            feature.setStyle(cc);
        } else {
            feature.setStyle(color);
        }
        return hight;
    }

    function addf(feature, name) {
        if (feature) {
            featrues[name] = addColor(feature);

            if (callback) {
                var attr = feature.getKeys();
                var properties = {};
                for (let i = 0; i < attr.length; i++) {
                    let item = attr[i];
                    if (item !== 'geometry')
                        properties[item] = feature.get(item);
                }
                var obj = {
                    attribute: properties,
                    feature: feature,
                    key: name,
                    type: "mapAdd"
                }

                callback(obj);
            }
        }
    }

    function getKey(feature, high) {
        var key = null;
        if (feature.attribute) {
            key = feature.get(high.key)
        }
        if (!key) {
            key = feature.id_;
        }
        return key;
    }

    this.addFeature = function (feature, clear) {
        if (this._layer) {

            if (feature) {
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
                    var name = getKey(feature, this);
                    var hightfeature = featrues[name];
                    if (hightfeature) {
                        removef(name, true);
                    } else {
                        addf(feature, name);
                    }
                }
            }
        } else {
            switch (this.type) {
                case "simple":
                    if (feature) {
                        var name = getKey(feature, this);
                        var hightfeature = featrues[name];
                        if (hightfeature) {
                            removef(name, true);
                        } else {
                            if (!clear) {
                                this.clear();
                            }
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
    this.addHighFeature = function (feature, layer) {
        if (feature && layer && layer.addHighFeature) {
            var geo = layer.addHighFeature(feature);
            this.addFeature(geo);
        }

    }
    this.removeFeature = function (key) {
        if (typeof key === "string") {
            removef(key, true);
        } else {
            var name = getKey(key, this);
            removef(name, true);
        }

    }
    /**
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    this.getFeatureById = function (id) {

        return null
    }

    this.length = function () {

        return 0;
    }
    this.clear = function () {
        for (var index in featrues) {
            removef(index, false);// 在函数中不执行下面代码
            delete featrues[index];
        }
    }
    this.setStyle = function (cc) {
        this.hcolor = cc.color ? cc.color : "#da2de7";
        color = this.style.getStyle(cc, cc.color);

    }

    this.setClickCallback = function (fun) {
        callback = fun;
    }
    /**
     * 0 移动到最底层
     * 1 上移一层
     * 2 移动到最顶层
     * -1 下移一层
     * @param index
     */
    this.setZIndex = function (index) {

    }


}


HighlightedLayer.addFeature = function (feature) {
    if (!highlight.highlightedlayer) {
        highlight.highlightedlayer = new HighlightedLayer();
    }
    highlight.highlightedlayer.addFeature(feature, true);
}
HighlightedLayer.removeFeature = function (feature) {
    if (highlight.highlightedlayer) {
        highlight.highlightedlayer.removeFeature(feature);
    }
}
HighlightedLayer.clear = function () {
    if (highlight.highlightedlayer) {
        highlight.highlightedlayer.clear();
    }
}
HighlightedLayer.setStyle = function (obj) {
    if (!highlight.highlightedlayer) {
        highlight.highlightedlayer = new HighlightedLayer();
    }
    if (highlight.highlightedlayer) {
        highlight.highlightedlayer.setStyle(obj);
    }
}
HighlightedLayer.setClickCallback = function (obj) {
    if (!highlight.highlightedlayer) {
        highlight.highlightedlayer = new HighlightedLayer();
    }
    if (highlight.highlightedlayer) {
        highlight.highlightedlayer.setClickCallback(obj);
    }
}

Object.defineProperties(HighlightedLayer.prototype, {
    layer: {
        set(v) {
            this._layer = v;
        }, get() {
            return this._layer;
        }
    }
})


export default HighlightedLayer;