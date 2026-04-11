/**
 * 路线规划
 * @param map 初始化的map
 * @returns {*} draw
 * @constructor
 */
import carpng from "../../../assets/img/car.png";
import atc from "../../../assets/img/atc.png";
import douglasPeucker from "../common/algorithnm/Douglas";
import TestStyle from "../style/TestStyle";

let obj = {
    scale: 0.6,
    size: 6,
    fill: 'rgba(255,204,185,0.1)',//填充颜色
    width: 5,//线宽
    anchor: [0.5, 0.5],
    radius: 10,//圆半径
    color: '#ff11bb',//线颜色
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

function TrackLayer(map, options) {

    options = options ? options : {};
    this._id = options.id;
    this.map = map;
    this.collection = {};
    this.featureCollection = {};
    let _this = this;
    this._style = obj;
    this._testStyle = new TestStyle();
    var pointfill = new ol.style.Fill({
        color: obj.fill
    });
    var pointstroke = new ol.style.Stroke({
        color: obj.color,
        width: 1.25
    });
    var pointimage = new ol.style.Circle({
        radius: obj.size,
        fill: pointfill,
        stroke: pointstroke,
    });
    let pointSyle = new ol.style.Style({
        image: pointimage,
        fill: pointfill,
    });

    this.sourceVector = new ol.source.Vector({wrapX: false});

    // Points 点的样式
    function pointStyleFunction(feature, resolution) {
        if (feature.getGeometry().getType() === 'Point') {
            if (resolution < 0.2) {
                let text = feature.get('text');
                if (text) {
                    if (resolution < _this._style.text.resolution) {
                        let color = feature.get('color');
                        var textcolor = _this._style.text.color
                        if (color) {
                            textcolor = color;
                            var obj = {
                                textAlign: 'center',
                                textBaseline: 'middle',
                                font: 'Arial',
                                scale: _this._style.text.scale * 2.8,
                                fill: new ol.style.Fill({color: textcolor}),
                                text: "" + text,
                                overflow: false,
                                //offsetX: that._style.text.offsetX,
                                //offsetY: that._style.text.offsetY
                            }

                            var style = new ol.style.Style({
                                text: new ol.style.Text(obj),
                                image: pointimage,
                                fill: pointfill,
                            });
                            return style
                        }

                        let name = feature.get('name');
                        var textstyle = _this._testStyle.getTextFun(text, textcolor);
                        if (name) {
                            if (_this._style.text.noffsetX || _this._style.text.noffsetX == 0) {
                                textstyle.setOffsetX(_this._style.text.noffsetX);
                            }
                            if (_this._style.text.noffsetY || _this._style.text.noffsetY == 0) {
                                textstyle.setOffsetY(-_this._style.text.noffsetY);
                            }
                        }

                        var style = new ol.style.Style({
                            text: textstyle,
                            image: pointimage,
                            fill: pointfill
                        });
                        return style
                    }
                }
            }
            return pointSyle;
        }
    }

    this.vectorLayer = new ol.layer.Vector({
        source: this.sourceVector,
        style: pointStyleFunction,

    });
    this._removefun = null;
    this._clickCallback = null;
    this.map.addLayer(this.vectorLayer);

    var textStyle = new ol.style.Style({
        text: new ol.style.Text({
            font: 'bold 26px Mirosoft Yahei',
            placement: 'line',
            text: "江 南 大 街",
            fill: new ol.style.Fill({
                color: '#000'
            }),
            offsetY: 3,
            stroke: new ol.style.Stroke({
                color: '#FFF',
                width: 2
            })
        })
    })
    var width = 20;
    //线颜色大小
    var buttomPathStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [4, 110, 74],
            width: width
        }),
    })
    var upperPathStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [0, 186, 107],
            width: width * 0.7
        }),
    })

    // 起点
    var outStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 13,
            fill: new ol.style.Fill({
                color: [4, 110, 74]
                //color:"#ee0d0d"
            })
        })
    })
    var midStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({
                color: [0, 186, 107]
            })
        })
    })
    var innerDot = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: [255, 255, 255]
            })
        })
    })

    //终点
    var foutrStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 13,
            fill: new ol.style.Fill({
                color: "#000"
            })
        })
    })
    var fmidStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({
                color: '#FFF'
            })
        })
    })
    var finnerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: '#000'
            })
        })
    })

    //箭头
    var myImage = new Image(32, 32);
    myImage.src = atc;
    var arrow = new ol.style.Style({
        image: new ol.style.Icon({
            img: myImage,
            //src: 'yujing.png',
            imgSize: [32, 32],
            scale: 0.50,
            rotation: 0
        })
    });
    //小车
    var mycar = new Image(32, 32);
    mycar.src = carpng;
    var car = new ol.style.Style({
        image: new ol.style.Icon({
            img: mycar,
            imgSize: [32, 32],
            scale: 0.7,
            rotation: 0
        })
    });


    let usestyle = {
        spoint: [outStyle, midStyle, innerDot],//起点
        epoint: [foutrStyle, fmidStyle, finnerStyle],//终点
        route: [buttomPathStyle, upperPathStyle],//线
        arrow: arrow,//箭头
        car: car//小车
    }

    let arrowLined = upperPathStyle;
    let arrowLinedUrl = {
        scale: 0.50,
        url: atc
    };

    var view = map.getView();

    var onzoomend = true;
    var zoomed = Math.floor(view.getZoom());
    let dpi = 25.4 / 0.28;
    let units = view.getProjection().getUnits();
    let mpu = ol.proj.Units.METERS_PER_UNIT[units];

    function zoomendfun(event, resolution, obj) {
        var zoom = Math.floor(view.getZoom());
        if (zoomed != zoom) {
            if (zoom >= 15) {
                for (var it in _this.featureCollection) {
                    var item = _this.featureCollection[it]
                    removefueatue(_this, item);
                    var result = createLine(_this, item.line.line, item.line.properties);
                    result.route.setStyle(_this.arrowStyle);
                    item.route = result.route;
                    item.point = result.points;
                }
            } else {
                let resolution = event.target.get('resolution');
                for (var it in _this.featureCollection) {
                    var item = _this.featureCollection[it]
                    removefueatue(_this, item);
                    var zoom1 = zoom * resolution * mpu;
                    var dline = douglasPeucker(item.line.line, zoom1);
                    var result = createLine(_this, dline, item.line.properties);
                    result.route.setStyle(_this.arrowStyle);
                    item.route = result.route;
                    item.point = result.points;

                }
            }

            zoomed = zoom;


        }
        // 在这里添加你的代码来处理缩放结束后的逻辑
    };
    this.moveFeature = function (evt) {
        var mapExtent = view.calculateExtent(map.getSize())
        var vct = ol.render.getVectorContext(evt);
        var resolu = map.getView().getResolution();
        for (var it in _this.collection) {
            var item = _this.collection[it];
            if (item.show) {
                var feature = item.route;
                let numArr = Math.ceil((feature.getGeometry().getLength() / resolu) / 100)
                var points = []
                var first = null;
                var coor = null;
                var frotation;
                for (var i = 0; i <= numArr; i++) {
                    let fracPos = (i / numArr) + item.offset;
                    if (fracPos > 1)
                        fracPos -= 1
                    var s = feature.getGeometry().getCoordinateAt(fracPos);
                    var sp = ol.extent.containsCoordinate(mapExtent, s);
                    if (sp) {
                        let pf = new ol.geom.Point(s);
                        points.push(pf);
                    } else {
                        continue;
                    }
                    if (coor) {
                        let dx = s[0] - coor[0];
                        let dy = s[1] - coor[1];
                        frotation = Math.atan(dx / dy);
                        coor = null;
                    }
                    if (!first) {
                        coor = s;
                        first = new ol.geom.Point(s);
                    }
                }
                var sitem = null;
                var eitem = null;
                if (usestyle.arrow) {
                    points.forEach((item) => {
                        eitem = item;
                        if (sitem) {
                            var end = eitem.getCoordinates();
                            var start = sitem.getCoordinates();
                            let dx = end[0] - start[0];
                            let dy = end[1] - start[1];
                            var rotation = Math.atan(dx / dy);
                            usestyle.arrow.getImage().setRotation(rotation);
                        }
                        sitem = eitem;
                        vct.setStyle(usestyle.arrow);
                        vct.drawGeometry(item);
                    });
                }

                car.getImage().setRotation(frotation);
                if (usestyle.car) {
                    vct.setStyle(usestyle.car);
                }
                vct.drawGeometry(first);
                item.offset = item.offset + 0.03 / numArr;
                //复位
                if (item.offset >= 1)
                    item.offset = 0.0
            }
        }
        _this.map.render();
    };
    var yes = true;

    this.stopAnimation = function (ended) {
        this.vectorLayer.un('postrender', this.moveFeature);
        yes = true;
    }
    this.clearFeature = function () {
        this.stopAnimation(true);
        this.sourceVector.clear();
        this.collection = {};
        this.featureCollection = {};

    }
    /**
     * 添加轨迹
     * @param object 对象参数 {coordinate:[[经度,纬度]]}
     */
    this.addRoute = function (line) {
        var id = createID(line.id);
        if (this.collection[id]) {
        } else {
            if (line.line.length >= 2) {
                var cooder = [];
                for (var i = 0; i < line.line.length; i++) {
                    var item = line.line[i];
                    cooder.push([parseFloat(item.longitude), parseFloat(item.latitude)]);
                }
                var routeLength = cooder.length;

                var spoint = new ol.Feature({
                    geometry: new ol.geom.Point(cooder[0]),
                });
                spoint._layer = this;
                spoint.setStyle(usestyle.spoint);
                this.sourceVector.addFeature(spoint);
                var epoint = new ol.Feature({
                    geometry: new ol.geom.Point(cooder[routeLength - 1]),
                });
                epoint._layer = this;

                epoint.setStyle(usestyle.epoint);

                this.sourceVector.addFeature(epoint);
                var route = new ol.Feature({
                    type: 'route',
                    geometry: new ol.geom.LineString(cooder),
                })
                route._layer = this;
                if (line.properties) {
                    for (var int in line.properties) {
                        route.set(int, line.properties[int]);
                    }
                }
                route.setStyle(usestyle.route)
                this.sourceVector.addFeature(route);
                this.collection[id] = {
                    epoint: epoint,
                    spoint: spoint,
                    route: route,
                    offset: 0.0,
                    show: true
                }
            }
        }
        if (yes) {
            this.vectorLayer.on('postrender', this.moveFeature);
            yes = false;
        }
    };
    /**
     * 添加带箭头不会动动线
     * @param line
     */
    this.addFeature = function (line) {
        var id = createID(line.id);

        if (line.line.length >= 2) {


            if (true) {
                this.douglasfun(line);
                //注册事件
                if (onzoomend) {
                    onzoomend = false;
                    view.on('change:resolution', zoomendfun);
                }
            } else {
                var cooder = [];
                for (var i = 0; i < line.line.length; i++) {
                    var item = line.line[i];
                    cooder.push([parseFloat(item.longitude), parseFloat(item.latitude)]);
                }
                var route = new ol.Feature({
                    geometry: new ol.geom.LineString(cooder),
                })
                if (line.properties) {
                    for (var int in line.properties) {
                        route.set(int, line.properties[int]);
                    }
                }
                route._layer = this;
                route.setStyle(this.arrowStyle);
                this.sourceVector.addFeature(route);
            }

        }
    }
    //抽希点
    this.douglasfun = function (line) {
        //抽希
        var id = createID(line.id);

        if (!this.featureCollection[id]) {
            this.featureCollection[id] = {
                point: [],
                route: null,
                line: line,
                show: true
            }
            var resolution = view.getResolution();
            var zoom = Math.floor(view.getZoom());
            var zoom1 = zoom * resolution * mpu;
            var dline = douglasPeucker(line.line, zoom1);
            var result = createLine(this, dline, line.line.properties);
            result.route.setStyle(this.arrowStyle);
            this.featureCollection[id].route = result.route;
            this.featureCollection[id].point = result.points;

        }


    }

    /**
     * 移除轨迹
     */
    this.clear = function () {
        this.clearFeature();
    };

    /**
     * 开始播放运动轨迹
     */
    this.start = function () {
        if (yes) {
            this.vectorLayer.on('postrender', this.moveFeature);
            yes = false;
            _this.map.render();

        }
    };

    /**
     * 结束播放
     */
    this.stop = function () {
        this.stopAnimation(true);
    };

    /**
     * 设置图层的可见性
     * @param object {visible:true/false}
     */
    this.setVisible = function (visible) {
        this.vectorLayer.setVisible(visible);
    };

    this.getVisible = function () {
        return this.vectorLayer.getVisible();
    };

    this.clear = function () {
        this.clearFeature()
        view.un('change:resolution', zoomendfun);
        onzoomend = true;
    };

    this.removeFeature = function (id) {
        var item = this.collection[id];
        if (item) {
            this.sourceVector.removeFeature(item.route);
            this.sourceVector.removeFeature(item.epoint);
            this.sourceVector.removeFeature(item.spoint);
            delete this.collection[id];
        }
        item = this.featureCollection[id];
        if (item) {
            removefueatue(this, item);
            delete this.featureCollection[id];
        }
    }
    this.showById = function (id) {
        var item = this.collection[id];
        if (item) {
            if (item.show) {
                this.sourceVector.removeFeature(item.route);
                this.sourceVector.removeFeature(item.epoint);
                this.sourceVector.removeFeature(item.spoint);
                item.show = false;
            } else {
                item.show = true;
                this.sourceVector.addFeature(item.route);
                this.sourceVector.addFeature(item.epoint);
                this.sourceVector.addFeature(item.spoint);
            }
        }
    }

    this.setStyle = function (style) {
        if (style) {

            if (style.line) {
                var lwidth = style.line.width ? style.line.width : 20;
                usestyle.route = [];
                if (style.line.ocolor) {
                    var line2 = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: style.line.ocolor,
                            width: lwidth
                        }),
                    });
                    usestyle.route.push(line2);
                }
                if (style.line.color) {
                    var line1 = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: style.line.color,
                            width: lwidth * 0.7
                        }),
                    })
                    arrowLined = line1;

                    usestyle.route.push(line1);
                }
            }
            if (style.point) {
                if (style.point.surl) {
                    var spint = new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: style.point.anchor,
                            src: style.point.surl,
                            scale: style.point.size,
                            rotation: 0
                        })
                    });
                    usestyle.spoint = spint;
                }
                if (style.point.eurl) {
                    var epint = new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: style.point.anchor,
                            src: style.point.eurl,
                            scale: style.point.size,
                            rotation: 0
                        })
                    });
                    usestyle.epoint = epint;
                }
            }
            let stroke = new ol.style.Stroke({
                color: '#37abff',
                width: 1.25
            });
            if (style.color) {
                stroke.setColor(style.color);
            }


            if (style.move) {
                if (style.move.arrow) {
                    var myImage = new Image();
                    myImage.src = style.move.arrow;
                    var arrow2 = new ol.style.Style({
                        image: new ol.style.Icon({
                            img: myImage,
                            scale: style.move.size,
                            rotation: 0,
                            imgSize: [32, 32]
                        })
                    });
                    arrowLinedUrl.url = style.move.arrow;
                    arrowLinedUrl.scale = style.move.size;
                    usestyle.arrow = arrow2;
                } else {
                    usestyle.arrow = null;
                }
                if (style.move.car) {
                    var car0 = new Image();
                    car0.src = style.move.car;
                    var car1 = new ol.style.Style({
                        image: new ol.style.Icon({
                            img: car0,
                            scale: style.move.size,
                            rotation: 0,
                            imgSize: [32, 32]
                        })
                    });

                    usestyle.car = car1;
                } else {
                    usestyle.car = null;
                }
            }
            this._style = style;
            this._testStyle.setStyle(style.text);
            if(style.fill){
                pointfill.setColor(style.fill);
            }if(style.color){
                pointstroke.setColor(style.color);
            }if(style.size){
                pointimage.setRadius(style.size);
            }

            if (style.distance && this.vectorLayer) {
                this.vectorLayer._distance = style.distance;
            }

        } else {
            //恢复默认的
            usestyle = {
                spoint: [outStyle, midStyle, innerDot],//起点
                epoint: [foutrStyle, fmidStyle, finnerStyle],//终点
                route: [buttomPathStyle, upperPathStyle],//线
                arrow: arrow,//箭头
                car: car//小车
            }
            arrowLinedUrl = {
                scale: 0.50,
                url: atc
            };
            if (this.vectorLayer) {
                this.vectorLayer._distance = null;
            }
        }
    };

    this.setClickCallback = function (fun) {
        this.removeClick();
        if (fun) {
            this._clickCallback = fun;
        }
    }
    this.setMoveCallback = function (fun) {

    }
    this.removeClick = function () {
        if (this._removefun) {
            this._removefun();
            this._removefun = null;
            this._clickCallback = null;
        }
    }
    this.contains = function (feature) {
        return false;
    }

    /**
     * 0 移动到最底层
     * 1 上移一层
     * 2 移动到最顶层
     * -1 下移一层
     * @param index
     */
    this.setZIndex = function (index) {
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
    /**
     *  采用闭包的写法，封装一个style
     * @param resolution 比例尺（跟比例尺相关的一个量，暂不明确具体是什么）
     * @returns {[*]}
     */

    this.arrowStyle = function (feature, resolution, zoom) {
        let geometry = feature.getGeometry();
        let styles = [arrowLined];
        var desg = geometry.getLength();
        let flatCoordinates = geometry.flatCoordinates.length / 2;
        let numArr = Math.ceil((geometry.getLength() / resolution) / 100);
        var mapExtent = view.calculateExtent(map.getSize());
        var zoom = map.getView().getZoom();
        var br = true;
        if (numArr > flatCoordinates && zoom > 13) {
            br = false;
        }
        if (br && false) {
            if (numArr > flatCoordinates) {
                numArr = flatCoordinates / 2;
            }
            var step = 1 / numArr * 0.5;
            for (var i = 0; i <= numArr; i++) {
                let fracPos = (i / numArr);
                if (fracPos > 1)
                    fracPos -= 1
                var s = geometry.getCoordinateAt(fracPos);
                var sp = ol.extent.containsCoordinate(mapExtent, s);
                if (sp) {
                    var flindex = fracPos - step;
                    var ceindex = fracPos + step;
                    var start = geometry.getCoordinateAt(flindex);
                    var end = geometry.getCoordinateAt(ceindex);
                    let dx = parseFloat(end[0]) - parseFloat(start[0]);
                    let dy = parseFloat(end[1]) - parseFloat(start[1]);
                    //旋转角度计算
                    let rotation = Math.atan2(dy, dx) - 1.57;
                    var po = new ol.style.Style({
                        geometry: new ol.geom.Point(s),
                        image: new ol.style.Icon({
                            src: arrowLinedUrl.url,
                            anchor: [0.5, 0.5],
                            imgSize: [32, 32],
                            scale: arrowLinedUrl.scale,
                            rotateWithView: true,
                            rotation: -rotation
                        })
                    });
                    styles.push(po);
                }
            }
        } else {
            /**
             * 遍历所有的点
             */
            geometry.forEachSegment(function (start, end) {
                //求两点之间的距离，勾股定理的应用
                let res = Math.sqrt(Math.pow(Math.abs(end[1] - start[1]), 2) + Math.pow(Math.abs(end[0] - start[0]), 2));
                if (res !== 0) {
                    //根据比例尺，算出两点之间需要绘制的箭头数量，下面的50是通过测试，获得的用户体验较好的一个值
                    let n = 1;
                    let pre = start;
                    //从第一个点开始绘制，直到绘制完所有的箭头
                    let m = 1;
                    while (m <= n) {
                        let next = dividedPoint(n, m, start, end);
                        var ds = drawStyle(pre, next, arrowLinedUrl, mapExtent);
                        if (ds) {
                            styles.push(ds);
                        }
                        pre = next;
                        m++;
                    }
                }
            });
        }
        return styles;
    };

}

function createID(id) {
    return "FlightTrajectory_" + id;
}

/**
 * 取a/b两个点的n等分点
 * @param n 分母
 * @param m 分子
 * @param p1 a点
 * @param p2 b点
 * @returns {*[]}
 */
function dividedPoint(n, m, p1, p2) {
    return [(p2[0] - p1[0]) / n * m + p1[0], (p2[1] - p1[1]) / n * m + p1[1]]
}

/**
 * 根据两个点的坐标，找出中间值，在中间绘制箭头图标，并且根据两个点，确定图标的角度
 *
 * @param start 开始的点
 * @param end 结束的点
 * @param obj 图片的url
 */
function drawStyle(start, end, obj, mapExtent) {
    let arrowLonLat = [(parseFloat(end[0]) + parseFloat(start[0])) / 2, (parseFloat(end[1]) + parseFloat(start[1])) / 2];
    var sp = ol.extent.containsCoordinate(mapExtent, arrowLonLat);
    if (sp) {

        let dx = parseFloat(end[0]) - parseFloat(start[0]);
        let dy = parseFloat(end[1]) - parseFloat(start[1]);
        //旋转角度计算
        let rotation = Math.atan2(dy, dx) - 1.57;
        //feature.set("inRotation", rotation);
        //设置图标
        return new ol.style.Style({
            geometry: new ol.geom.Point(arrowLonLat),
            image: new ol.style.Icon({
                src: obj.url,
                anchor: [0.5, 0.5],
                imgSize: [32, 32],
                scale: obj.scale,
                rotateWithView: true,
                rotation: -rotation
            })
        });
    }
    return null;
}

function createLine(that, dline, properties) {
    var cooder = [];
    var points = [];
    for (var i = 0; i < dline.length; i++) {
        var jtem = dline[i];
        cooder.push([parseFloat(jtem.longitude), parseFloat(jtem.latitude)]);
        var point = createPoint(that, jtem);
        points.push(point);
    }
    var route = new ol.Feature({
        geometry: new ol.geom.LineString(cooder),
    })
    if (properties) {
        for (var int in properties) {
            route.set(int, properties[int]);
        }
    }
    route._layer = that;
    that.sourceVector.addFeature(route);

    return {
        points: points,
        route: route
    };
}

function createPoint(that, object) {
    var epoint = new ol.Feature({
        geometry: new ol.geom.Point([parseFloat(object.longitude), parseFloat(object.latitude)]),
    });
    if (object) {
        for (var int in object) {
            epoint.set(int, object[int]);
        }
    }
    if (object.label) {
        epoint.set("text", object.label);

    }
    epoint._layer = that;
    that.sourceVector.addFeature(epoint);
    return epoint;
}

function removefueatue(that, object) {
    that.sourceVector.removeFeature(object.route);
    for (var i = 0; i < object.point.length; i++) {
        that.sourceVector.removeFeature(object.point[i]);
    }

}

export default TrackLayer;


