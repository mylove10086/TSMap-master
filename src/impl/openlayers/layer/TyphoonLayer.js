/**
 * 台风
 * @param map
 * @constructor
 */
import PopupsRight from "../overlay/PopupsRight";
import win from "../../../assets/img/win.gif";

import lv from "../../../assets/img/tf/lv.png";
import lan from "../../../assets/img/tf/lan.png";
import huang from "../../../assets/img/tf/huang.png";
import zhong from "../../../assets/img/tf/zhong.png";
import fen from "../../../assets/img/tf/fen.png";
import hong from "../../../assets/img/tf/hong.png";
import TestStyle from "../style/TestStyle";
import TurfObject from "../base/TurfObject";

let obj = {
    scale: 0.6,
    fill: 'rgba(255,204,185,0.1)',//填充颜色
    width: 5,//线宽
    anchor: [0.5, 0.5],
    radius: 10,//圆半径
    color: 'rgba(177,88,152,0.57)',//线颜色
    label: "type",
    text: {
        color: '#ffffff',
        scale: 0.6,
        overflow: true,//设置允许文本超出标签位置处多边形的宽度或所沿路径的长度。
        resolution: 0.05,//在多少分辨率下才显示标注
        offsetX: 0,
        offsetY: 10,
        distance: [0, 2000000],
    }
};

/**
 * 台风
 * @param map
 * @constructor
 */
class TyphoonLayer {
    constructor(map, options) {
        options = options ? options : {};
        this._id = options.id;

        this.timefun = null;//setInterval的返回值
        this.map = map;
        let radius = 5;

        this._removefun1 = null;
        this._movecallback = null;
        this.tfbuffer = true;

        this._style = obj;
        this.collection = {};
        let that = this;
        this.customclickCallback = null;
        this._testStyle = new TestStyle();
        this._testStyle.setStyle(this._style.text);

        // Points
        function pointStyleFunction(feature, resolution) {
            if (feature.getGeometry().getType() === 'Point') {
                if (resolution < 0.2) {
                    let text = feature.get('text');
                    if (text) {
                        if (resolution < that._style.text.resolution) {
                            let color = feature.get('color');
                            var textcolor = that._style.text.color
                            if (color) {
                                textcolor = color;
                                var obj = {
                                    textAlign: 'center',
                                    textBaseline: 'middle',
                                    font: 'Arial',
                                    scale: that._style.text.scale * 2.8,
                                    fill: new ol.style.Fill({color: textcolor}),
                                    text: "" + text,
                                    overflow: false,
                                    //offsetX: that._style.text.offsetX,
                                    //offsetY: that._style.text.offsetY
                                }

                                var style = new ol.style.Style({
                                    text: new ol.style.Text(obj)
                                });
                                return style
                            }

                            let name = feature.get('name');
                            var textstyle = that._testStyle.getTextFun(text, textcolor);
                            if (name) {
                                if (that._style.text.noffsetX || that._style.text.noffsetX == 0) {
                                    textstyle.setOffsetX(that._style.text.noffsetX);
                                }
                                if (that._style.text.noffsetY || that._style.text.noffsetY == 0) {
                                    textstyle.setOffsetY(-that._style.text.noffsetY);
                                }
                            }
                            var style = new ol.style.Style({
                                text: textstyle
                            });
                            return style


                        }
                    }
                }
                return [];
            }
        }

        this.sources = new ol.source.Vector();
        this.vectorLayer = new ol.layer.Vector({
            source: this.sources,
            style: pointStyleFunction,
        });

        var rot = 360;
        this.vectorLayer.on('postrender', function (evt) {
            rot -= 0.10;
            for (var index in that.collection) {
                var item = that.collection[index];
                if (item.billboard) {
                    var bs = item.billboard.getStyle();
                    var image = bs.getImage();
                    image.setRotation(rot);
                    item.billboard.setStyle(bs);
                }
            }
            if (rot < 0) {
                rot = 360;
            }
        });

        map.addLayer(this.vectorLayer);

        this.showFeautre = function (aray, bl) {
            if (bl) {
                for (let i = 0; i < aray.length; i++) {
                    that.sources.addFeature(aray[i]);
                }
            } else {
                for (let i = 0; i < aray.length; i++) {
                    that.sources.removeFeature(aray[i]);

                }
            }


        }

        this.typhoon_legend = {
            "grade6": {
                color: "#00FF03",
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        fill: new ol.style.Fill({
                            color: '#00FF03'
                        })
                    })
                }),
                grade: 6, grade_name: "热带低压", grade_ename: "TD"
            },
            "grade7": {
                color: "#00FF03",
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        fill: new ol.style.Fill({
                            color: '#00FF03'
                        })
                    })
                }),
                grade: 7,
                grade_name: "热带低压",
                grade_ename: "TD"
            },
            "grade8": {
                color: "#0062FE", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#0062FE'
                        })
                    }),
                }),
                grade: 8, grade_name: "热带风暴", grade_ename: "TS"
            },
            "grade9": {
                color: "#0062FE", image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        radius: radius,

                        color: '#0062FE'
                    })
                }),
                grade: 9,
                grade_name: "热带风暴",
                grade_ename: "TS"
            },
            "grade10": {
                color: "#FDFA00", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#FDFA00'
                        })
                    }),
                }), grade: 10, grade_name: "强热带风暴", grade_ename: "STS"
            },
            "grade11": {
                color: "#FDFA00", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#FDFA00'
                        })
                    })
                }),
                grade: 11,
                grade_name: "强热带风暴",
                grade_ename: "STS"
            },
            "grade12": {
                color: "#FDAC03", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#FDAC03'
                        })
                    }),
                }), grade: 12, grade_name: "台风", grade_ename: "TY"
            },
            "grade13": {
                color: "#FDAC03", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#FDAC03'
                        })
                    })
                }),
                grade: 13,
                grade_name: "台风",
                grade_ename: "TY"
            },
            "grade14": {
                color: "#F072F6", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#F072F6'
                        })
                    }),
                }), grade: 14, grade_name: "强台风", grade_ename: "STY"
            },
            "grade15": {
                color: "#F072F6", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#F072F6'
                        })
                    })
                }),
                grade: 15,
                grade_name: "强台风",
                grade_ename: "STY"
            },
            "grade16": {
                color: "#FD0002", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#FD0002'
                        })
                    }),
                }), grade: 16, grade_name: "超强台风", grade_ename: "SUPERTY"
            },
            "grade17": {
                color: "#FD0002", style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,

                        fill: new ol.style.Fill({
                            color: '#FD0002'
                        })
                    })
                }),
                grade: 17,
                grade_name: "超强台风",
                grade_ename: "SUPERTY"
            },
            line: {
                color: "rgba(0,150,255,0.8)",
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,150,255,0.8)',
                        width: 3
                    })
                }),
                weight: 3
            },
            radius12: {
                color: "rgba(255,0,0,0.4)",
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: "rgba(255,0,0,0.4)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(255,0,0,0.8)",
                        width: 0.8
                    })
                }), name: "12 级风圈"
            },
            radius10: {
                color: "rgba(248,213,0,0.5)",
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(248,213,0,0.3)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(248,213,0,0.8)",
                        width: 0.8
                    })
                }), name: "10 级风圈"
            },
            radius7: {
                color: "rgba(36,225,143,0.5)",
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: "rgba(36,225,143,0.2)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "rgba(36,225,143,0.8)",
                        width: 0.8
                    })
                }), name: "7 级风圈"
            }

        }
        //预测线路颜色
        var lineDash = [10, 10];
        this.forecast_stations = {
            "中国": {
                tm: "中国", th: "CN", color: "#FF4050",
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "#FF4050",
                        width: 3,
                        lineDash: lineDash
                    })
                }), alias: "中国", minZoom: 2
            },
            "香港": {
                tm: "香港",
                th: "HK",
                color: "#FF66FF",
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "#FF66FF",
                        width: 3,
                        lineDash: lineDash
                    })
                }),
                alias: "中国香港",
                minZoom: 5
            },
            "日本": {
                tm: "日本", th: "JP", color: "#43FF4B", style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#43FF4B',
                        width: 3,
                        lineDash: lineDash
                    })
                }), alias: "日本", minZoom: 5
            },
            "台湾": {
                tm: "台湾",
                th: "TW",
                color: "#FFA040", style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "#FFA040",
                        width: 3,
                        lineDash: lineDash
                    })
                }),
                alias: "中国台湾",
                minZoom: 5
            },
            "美国": {
                tm: "美国", th: "US", color: "#40DDFF", style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "#40DDFF",
                        width: 3,
                        lineDash: lineDash
                    })
                }), alias: "美国", minZoom: 5
            },
            "韩国": {
                tm: "韩国",
                th: "KR",
                color: "#669999", style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#669999',
                        width: 3,
                        lineDash: lineDash
                    })
                }),
                alias: "韩国",
                minZoom: 5
            },
            "欧洲": {
                tm: "欧洲", th: "OZ", color: "#246ED4", style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#246ED4',
                        width: 3,
                        lineDash: lineDash
                    })
                }), alias: "欧洲", minZoom: 2
            }
        };

        this._clickCallback = function (layer, feature, object) {

            var attribute = feature.get("attribute");

            if (attribute && attribute.type === "con") {
                if (that.customclickCallback) {

                    that.customclickCallback(layer, {
                        attribute: attribute
                    }, object);
                }

                if (attribute.fcline) {
                    return
                }
                that.setRadius_quad(attribute);

            }

        }
        this.moveCallbackfun = function (layer, features, object) {
            if (Object.keys(that.collection).length > 0) {
                if (features && that._movecallback) {
                    for (var i = 0; i < features.length; i++) {
                        var attribute = features[i].get("attribute");
                        if (attribute && attribute.type === "con") {
                            var obj = {
                                properties: attribute,
                                coordinate: object.coordinate,
                                screen: object.screen,
                                zoom: object.zoom
                            }
                            that._movecallback(layer, features[i], obj);
                            break;
                        }
                    }
                }
                if (that._movecallback)
                    that._movecallback(layer, null, null);
            }
        }

    }

    //设置风圈
    setRadius_quad(attribute) {
        var key = createID(attribute.id);
        var tf = this.collection[key];
        if (tf) {
            if (attribute.coordinates) {

                var center = attribute.coordinates;
                var cpoint = new ol.geom.Point(center);
                tf.billboard.setGeometry(cpoint);
                var image = getimage(parseFloat(attribute.power));
                tf.billboard.getStyle().setImage(new ol.style.Icon({
                    src: image,
                    anchor: [0.5, 0.5],
                    scale: 1.5,
                }))
                for (var i = 0; i < tf.polygon.length; i++) {
                    this.sources.removeFeature(tf.polygon[i].poly);
                    this.sources.removeFeature(tf.polygon[i].label);
                }

                //风圈
                if (attribute.radius7 && attribute.radius7 > 0 && attribute.radius7_quad) {
                    var objs = this.getpolygon([attribute.coordinates[0], attribute.coordinates[1]], attribute.radius7_quad, this.typhoon_legend.radius7);
                    tf.polygon.push(objs);
                }
                if (attribute.radius10 && attribute.radius10 > 0 && attribute.radius10_quad) {
                    var objs = this.getpolygon([attribute.coordinates[0], attribute.coordinates[1]], attribute.radius10_quad, this.typhoon_legend.radius10);
                    tf.polygon.push(objs);
                }
                if (attribute.radius12 && attribute.radius12 > 0 && attribute.radius12_quad) {
                    var objs = this.getpolygon([attribute.coordinates[0], attribute.coordinates[1]], attribute.radius12_quad, this.typhoon_legend.radius12);
                    tf.polygon.push(objs);
                }

            }
            //预测线路
            this.removeForecast(tf.forecast);// 删除预报线路
            if (attribute.forecast) {
                tf.forecast = this.addForecast(attribute, attribute.coordinates, attribute.id);
            }
        }


    }


    //让风圈动起来
    runingfun() {
        if (!this.timefun) {
            var that = this;
            this.timefun = setInterval(function () {
                that.map.render();

            }, 500);
        }
    }

    /**
     * 显示与隐藏一条台风线路
     * @param object{ id:'',//台风的id
     *              bl: true/false}
     */
    show(object) {
        let name = buildName("typhoonlayer", object.id);
        /*if (this.windData[name]) {
            if (object.bl !== this.windData[name].show) {
                let item = this.windData[name];
                this.showFeautre(item.line, !this.windData[name].show);
                this.showFeautre(item.point, !this.windData[name].show);
                this.showFeautre(item.text, !this.windData[name].show);
                this.showFeautre([item.feature], !this.windData[name].show);
                this.windData[name].show = !this.windData[name].show ? true : false;
            }
        }*/
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

    removeClick() {
        if (this._removefun) {
            this._removefun();
            this._removefun = null;
            this.customlickCallback = null;
        }
    }

    /**
     * 图层的单击事件注册
     * @param fun 函数/null 传函数是注册事件，null是移除单击事件
     */
    setClickCallback(fun) {
        this.removeClick();

        if (fun) {
            this.customclickCallback = fun;
        }
    }

    //移除鼠标移动事件
    moveClick() {
        if (this._removefun1) {
            this._removefun1();
            this._removefun1 = null;
            this._movecallback = null;
        }
    }

    setMoveCallback(fun) {
        this.moveClick();
        if (fun) {
            this._removefun1 = this.map._eventMove.addEventListener(this.moveCallbackfun, this);
            this._movecallback = fun;
        }
    }

    contains(feature) {
        return this.sources.hasFeature(feature);
    }

    getGrade(power) {
        var grade = null;

        switch (power) {
            case 6:
                grade = this.typhoon_legend.grade6;
                break;
            case 7:
                grade = this.typhoon_legend.grade7;
                break;
            case 8:
                grade = this.typhoon_legend.grade8;
                break;
            case 9:
                grade = this.typhoon_legend.grade9;
                break;
            case 10:
                grade = this.typhoon_legend.grade10;
                break;
            case 11:
                grade = this.typhoon_legend.grade11;
                break;
            case 12:
                grade = this.typhoon_legend.grade12;
                break;
            case 13:
                grade = this.typhoon_legend.grade13;
                break;
            case 14:
                grade = this.typhoon_legend.grade14;
                break;
            case 15:
                grade = this.typhoon_legend.grade15;
                break;
            case 16:
                grade = this.typhoon_legend.grade16;
                break;
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
                grade = this.typhoon_legend.grade17;
                break;
            default:
                grade = this.typhoon_legend.grade6;
                break;
        }
        return grade;
    }

    removeAll() {

        this.sources.clear();

        this.collection = {};
        clearInterval(this.timefun);
        this.timefun = null;


    }

    removeLayer() {
        this.removeClick();

        this.removeAll();
    }

    setStyle(object) {
        if (object && object.buffer) {
            this.tfbuffer = object.buffer;
        } else {
            this.tfbuffer = false;

        }
        if (object) {

            /*if (object.text && object.text.scale) {
                this._style.text.scale = object.text.scale;
            }
            if (object.text && object.text.color) {
                this._style.text.color = object.text.color;
            }
            if (object.text && object.text.resolution) {
                this._style.text.resolution = object.text.resolution;
            }  if (object.text && object.text.offsetX) {
                this._style.text.offsetX = object.text.offsetX;
            }*/
            this._style = object;
            this._testStyle.setStyle(object.text);

            if (object.distance && this.vectorLayer) {
                this.vectorLayer._distance = object.distance;
            }
        } else {
            this._style = obj;
            if (this.vectorLayer) {
                this.vectorLayer._distance = null;
            }
        }
    }

    clear() {
        this.removeAll();
    }

    removeFeature = function (id) {
        var lid = createID(id);
        if (this.collection[lid]) {
            this.remavefun(this.collection[lid]);
            delete this.collection[lid];
        }
    }

    remavefun(feature) {
        for (var i = 0; i < feature.point.length; i++) {
            this.sources.removeFeature(feature.point[i]);
        }
        for (var i = 0; i < feature.label.length; i++) {
            this.sources.removeFeature(feature.label[i]);
        }
        for (var i = 0; i < feature.line.length; i++) {
            this.sources.removeFeature(feature.line[i]);
        }
        for (var i = 0; i < feature.polygon.length; i++) {
            this.sources.removeFeature(feature.polygon[i].poly);
            this.sources.removeFeature(feature.polygon[i].label);
        } for (var i = 0; i < feature.fwpolygon.length; i++) {
            this.sources.removeFeature(feature.fwpolygon[i]);
        }
        //删除预报路线
        this.removeForecast(feature.forecast);
        this.sources.removeFeature(feature.billboard);
    }

    removeForecast(forecast) {
        //删除预报路线
        if (forecast) {
            for (var i = 0; i < forecast.point.length; i++) {
                this.sources.removeFeature(forecast.point[i]);
            }
            for (var i = 0; i < forecast.label.length; i++) {
                this.sources.removeFeature(forecast.label[i]);
            }
            for (var i = 0; i < forecast.line.length; i++) {
                this.sources.removeFeature(forecast.line[i]);
            }
        }

    }

    //设置风圈位置
    setPassing(obj) {
        var lid = createID(obj.id);
        if (this.collection[lid]) {
            var itme = this.collection[lid];
            var index = obj.index;
            if (index <= itme.plength) {
                var point = itme.point[index];
                var attribute = point.get("attribute");

                this.setRadius_quad(attribute);
            }
        }

    }
}

function buildName(type, id) {
    return "" + type + "_" + id;

}

/**
 * 设置样式
 * @param grade
 * @param styles
 * @returns {*}
 */
function getListStyle(grade, styles) {
    if (grade >= 16) {
        return styles["grade16"];
    } else if (grade >= 14) {
        return styles["grade14"];
    } else if (grade >= 12) {
        return styles["grade12"];
    } else if (grade >= 10) {
        return styles["grade10"];
    } else if (grade >= 0) {
        return styles["grade0"];
    }
}

function createID(id) {
    return "TyphoonLayer_" + id;
}

function getPoints(center, cradius, startAngle, points) {
    let radius = cradius / 100;
    let pointNum = 32;
    let endAngle = startAngle + 90;
    let sin, cos, x, y, angle;
    for (let i = 0; i <= pointNum; i++) {
        angle = startAngle + (endAngle - startAngle) * i / pointNum;
        sin = Math.sin(angle * Math.PI / 180);
        cos = Math.cos(angle * Math.PI / 180);
        x = center[0] + radius * sin;
        y = center[1] + radius * cos;
        points.push([x, y]);
    }
}

function getimage(level) {
    if (level <= 7) {
        return lv;
    }
    if (level <= 9) {
        return lan;
    }
    if (level <= 11) {
        return huang;
    }
    if (level <= 13) {
        return zhong;
    }
    if (level <= 15) {
        return fen;
    }
    return hong;
}

function turfBuffer(buffered1, sylte, that) {


    let polygon = new ol.geom.Polygon(buffered1.geometry.coordinates);
    var entity = new ol.Feature({
        geometry: polygon
    });
    var st = new ol.style.Style({
        fill: new ol.style.Fill({
            color: sylte
        })
    })
    entity.setStyle(st);

    that.sources.addFeature(entity);
    return entity
}

TyphoonLayer.prototype.getpolygon = function (center, radius_quad, sylte) {
    // 风圈
    var entity = null;
    var point = [center[0], center[1]];
    var points = [];
    getPoints(point, radius_quad.ne, 0, points);
    getPoints(point, radius_quad.se, 90, points);
    getPoints(point, radius_quad.sw, 180, points);
    getPoints(point, radius_quad.nw, 270, points);
    points.push(points[0]);
    let polygon = new ol.geom.Polygon([points]);
    entity = new ol.Feature({
        geometry: polygon
    });
    entity.setStyle(sylte.style);

    this.sources.addFeature(entity);

    var lpoint = new ol.geom.Point(points[0]);
    let lnabel = new ol.Feature({
        geometry: lpoint,
        text: true
    });
    lnabel.set("text", sylte.name.toString());
    lnabel.set("color", sylte.color);
    this.sources.addFeature(lnabel);
    return {
        poly: entity,
        label: lnabel
    };
}
/**
 * 添加台风
 * @param object 数据看tf.js
 * @constructor
 */
TyphoonLayer.prototype.addFeature = function (object) {
    //旋转的风
    var id = createID(object.id);
    if (!this.collection[id]) {
        var line = object.line;
        if (line == 0) {
            return;
        }
        var feature = {
            plength: line.length,//台风点个数
            point: [],
            line: [],
            billboard: null,
            polygon: [],
            fwpolygon: [],
            label: [],
            forecast: null//预测线路
        };
        var polyline = [];
        var power;
        var sitme = line[0];

        // 名称
        var lnabel = this.addlabel(sitme.coordinates, object.label);
        lnabel.set("name", "名称");

        feature.label.push(lnabel);
        var coordinates = [];
        var base = null;

        //线和名称
        for (var i = 0; i < line.length; i++) {
            const item = line[i];
            var center = item.coordinates;
            if (base) {
                var x = base[0] == item.coordinates[0];
                var y = base[1] == item.coordinates[1];
                if (x && y) {
                    continue;
                }
            }
            base = item.coordinates;
            coordinates.push(item.coordinates);

            polyline.push(center);
            power = item.properties.power ? parseFloat(item.properties.power) : 6;
            var point = null;
            var grade = this.getGrade(power);
            point = new ol.geom.Point(center);
            let pf = new ol.Feature({
                geometry: point,
            });
            pf.setStyle(grade.style);

            var attribute = item.properties;
            attribute.num = i;
            attribute.id = object.id;
            attribute.type = "con";
            attribute.coordinates = item.coordinates;
            pf.set('attribute', attribute);
            pf._layer = this;
            var name = this.addlabel(center, attribute.label);
            feature.label.push(name);
            this.sources.addFeature(pf);
            feature.point.push(pf);
        }

        if (polyline.length > 1) {
            let ls = new ol.geom.LineString(polyline);
            let fl = new ol.Feature({
                geometry: ls,
            });
            fl.setStyle(this.typhoon_legend.line.style);
            this.sources.addFeature(fl);

            feature.line.push(fl);
        }
        //旋转的点
        var it = line[line.length - 1];
        var ccenter = it.coordinates;
        var cpoint = new ol.geom.Point(ccenter);
        let cyanPolygon = new ol.Feature({
            geometry: cpoint,
        });
        cyanPolygon.set("power", power);
        var styel = new ol.style.Style({
            image: new ol.style.Icon({
                src: getimage(parseFloat(power)),
                anchor: [0.5, 0.5],
                scale: 1.5,
            })
        });
        cyanPolygon.setStyle(styel);
        this.sources.addFeature(cyanPolygon);


        var properties = it.properties;
        /*var rlabel = this.addlabel(it.coordinates, properties.label);
        feature.label.push(rlabel);*/

        //风圈
        if (properties.radius7 && properties.radius7 > 0 && properties.radius7_quad) {
            var objs = this.getpolygon([it.coordinates[0], it.coordinates[1]], properties.radius7_quad, this.typhoon_legend.radius7);
            feature.polygon.push(objs);
        }
        if (properties.radius10 && properties.radius10 > 0 && properties.radius10_quad) {
            var objs = this.getpolygon([it.coordinates[0], it.coordinates[1]], properties.radius10_quad, this.typhoon_legend.radius10);
            feature.polygon.push(objs);
        }
        if (properties.radius12 && properties.radius12 > 0 && properties.radius12_quad) {
            var objs = this.getpolygon([it.coordinates[0], it.coordinates[1]], properties.radius12_quad, this.typhoon_legend.radius12);
            feature.polygon.push(objs);
        }


        // 影像范围
        if (this.tfbuffer) {
            var radius = 120;
            var colors = this._style.color;
            var bufferCoor = TurfObject.typhoonBuffer(coordinates, radius);
            var buf = turfBuffer(bufferCoor, colors, this);
            feature.fwpolygon.push(buf);
        }
        // 预测
        if (properties.forecast) {

            feature.forecast = this.addForecast(properties, center, object.id);

        }

        feature.billboard = cyanPolygon;
        this.collection[id] = feature;
    }
    this.runingfun();

};

TyphoonLayer.prototype.addlabel = function (center, text) {

    var point = new ol.geom.Point(center);
    let lnabel = new ol.Feature({
        geometry: point,
        text: true
    });
    lnabel.set("text", text);
    //lnabel.setStyle(style);
    this.sources.addFeature(lnabel);

    return lnabel;
}
//预测线路
TyphoonLayer.prototype.addForecast = function (properties, center, id) {
    var forecast = properties.forecast;
    var result = {
        point: [],
        label: [],
        line: [],
    };
    for (var i = 0; i < forecast.length; i++) {
        const item = forecast[i];
        var ipolyline = [center];//添加起点
        var ipower;
        for (var j = 0; j < item.line.length; j++) {
            var jtem = item.line[j];
            var jcenter = jtem.coordinates;
            ipolyline.push(jcenter);
            ipower = jtem.properties.power ? parseFloat(jtem.properties.power) : 6;
            var jgrade = this.getGrade(ipower);
            var jpoint = new ol.geom.Point(jcenter);
            let jpf = new ol.Feature({
                geometry: jpoint,
                rotation: 0
            });
            jpf.setStyle(jgrade.style);

            var attribute = jtem.properties;
            attribute.num = i;
            attribute.id = id;
            attribute.type = "con";
            attribute.fcline = "con";
            attribute.forecastname = item.label;

            attribute.coordinates = item.coordinates;
            jpf.set('attribute', attribute);
            jpf._layer = this;
            this.sources.addFeature(jpf);
            result.point.push(jpf);

            var rqlabel = this.addlabel(jtem.coordinates, jtem.properties.label);
            result.label.push(rqlabel);
        }

        //if (polyline.length > 1) {
        var yccolor = this.forecast_stations[item.name];
        if (!yccolor) {
            yccolor = this.forecast_stations["中国"]
        }

        let ls = new ol.geom.LineString(ipolyline);
        let fl = new ol.Feature({
            geometry: ls,
        });
        fl.setStyle(yccolor.style);

        this.sources.addFeature(fl);

        result.line.push(fl);
        //}
    }

    return result;
}


TyphoonLayer.getQuad = function (center, radius_quad) {
    var point = [center[0], center[1]];
    var points = [];
    getPoints(point, radius_quad.ne, 0, points);
    getPoints(point, radius_quad.se, 90, points);
    getPoints(point, radius_quad.sw, 180, points);
    getPoints(point, radius_quad.nw, 270, points);
    var position1 = [];
    for (var i = 0; i < points.length; i++) {
        var item = points[i];
        position1.push(item);
    }
    return position1;
}
export default TyphoonLayer;
