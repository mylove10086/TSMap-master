/**
 * 电线面对样式
 */
import TestStyle from "./TestStyle";

function degreetoradian(degree) {
    return degree * (Math.PI / 180);  // 转换为弧度
}


class Styles {

    constructor() {
        this.anchor = null;//图片锚点位置
        this.url = null;//图片url
        this.fill = null;//填充颜色
        this.width = null;//线宽
        this.radius = 1;//圆半径
        this.color = null;//线颜色
        this.scale = 1;//图片缩放比例
        this.rotation = 0;//图片旋转角度，顺时针方向
        this.lineDash = [0, 0];//虚实线
        this.styleSet = {};
        this.vectorLayer = null;
        this.textdistance = null;//文字在那个级别下才显示
        this.label = null;
        this.types = 'default';
        this.text = {
            scale: 1,
            color: '#ffffff',
            offsetX: 0,
            offsetY: 0
        };//文字的样式
        this._resolution = 0.05;
        this.rotationlabel = null;//根据属性设置图标的角度

        this.style = null;//显示标注时设置的样式


        this.textStyle = new TestStyle();
        let _this = this;
        let rotationobj = {};

        //根据数组的样式和属性名称显示那种样式
        this.styleFun = function (feature, resolution) {
            let s = feature.get(_this.types);
            let rstyle = _this.styleSet[s];
            if (rstyle) {
                if (_this.textStyle && _this.textStyle.label && resolution < _this._resolution) {
                    return [rstyle, _this.textStyle.getStyle(feature)];
                }
                return rstyle;
            } else {
                return _this.styleSet["default"];
            }
        }
        //根据属性显示不同的文字
        this.styleFun1 = function (feature, resolution) {
            var style = _this.style;
            if (feature.getGeometry().getType() === 'Point' && _this.rotationlabel) {
                //根据属性设置角度
                let rotation = feature.get(_this.rotationlabel);
                if (!rotation) {
                    var image = style.getImage();
                    image.setRotation(0);
                } else {
                    var image = style.getImage();
                    var ro = degreetoradian(rotation)
                    image.setRotation(ro);
                }

            }
            if (_this.textStyle && _this.textStyle.label && resolution < _this._resolution) {
                var img = _this.textStyle.getStyle(feature, resolution);//文字
                if (img) {
                    return [style, img];
                } else {
                    return style;
                }
            } else {
                return style;
            }

        };
    }

    init() {
        this.anchor = null;//图片锚点位置
        this.url = null;//图片url
        this.fill = null;//填充颜色
        this.width = null;//线宽
        this.radius = 1;//圆半径
        this.color = null;//线颜色
        this.scale = 1;//图片缩放比例
        this.rotation = 0;//图片旋转角度，顺时针方向
        this.lineDash = [0, 0];//虚实线
        this.styleSet = {};
        this.vectorLayer = null;
        this.textdistance = null;
        this.label = null;
        this.types = 'default';
        this.text = {
            scale: 1,
            color: '#ffffff',
            offsetX: 0,
            offsetY: 0,
            overflow: false
        };//文字的样式

        this.style = null;//显示标注时设置的样式
    }


    setText(obj) {
        this.text.scale = obj.scale ? obj.scale : 1;
        this.text.color = obj.color ? obj.color : '#ffffff';
        this.text.offsetX = obj.offsetX ? parseFloat(obj.offsetX) : 0;
        this.text.offsetY = obj.offsetY ? -parseFloat(obj.offsetY) : 0;
    }

    getStyle(style, ihcolor) {
        let scale = 1;
        if (style) {
            if (style.anchor) {
                var as = Array.isArray(style.anchor);
                if (as) {
                    let x = style.anchor[0];
                    let y = style.anchor[1];
                    x = x >= -0.5 ? x <= 1.5 ? x : 1.5 : -0.5;
                    y = y >= -0.5 ? y <= 1.5 ? y : 1.5 : -0.5;
                    this.anchor = [x, y];
                } else {
                    this.anchor = [0.5, 0.5];
                }
            }
            if (style.url) {
                this.url = style.url;
            }
            if (style.fill) {
                this.fill = style.fill;
            }
            if (style.radius || style.size) {
                this.radius = style.radius ? style.radius : style.size;
            } else {
                this.radius = 5;
            }
            this.radius = this.radius * 0.4;
            if (style.color) {
                this.color = style.color;
            }
            if (style.width >= 0)
                this.width = style.width;
            if (style.scale > 0)
                scale = style.scale;
        }

        let fill;

        if (this.fill) {
            fill = new ol.style.Fill({
                color: this.fill
            });
        } else {
            fill = new ol.style.Fill({
                color: 'rgba(255,255,255,0.4)'
            });
        }

        let stroke = new ol.style.Stroke({
            color: '#37abff',
            width: 1.25
        });

        if (this.width && this.width >= 0) {
            stroke.setWidth(this.width);
        }
        if (this.color) {
            stroke.setColor(this.color);
        }
        //虚线
        if (style && style.lineDash) {
            // lineDash [10,10]
            stroke.setLineDash(style.lineDash);
        }

        let image;

        if (this.url && this.anchor) {
            if (ihcolor) {
                image = new ol.style.Icon({
                    anchor: this.anchor,
                    src: this.url,
                    scale: scale,
                    rotation: this.rotation,
                    color: ihcolor
                });
            } else {
                image = new ol.style.Icon({
                    anchor: this.anchor,
                    src: this.url,
                    scale: scale,
                    rotation: this.rotation
                });
            }

        } else if (this.url) {
            if (ihcolor) {
                image = new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    src: this.url,
                    scale: scale,
                    rotation: this.rotation,
                    color: ihcolor
                });
            } else {
                image = new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    src: this.url,
                    scale: scale,
                    rotation: this.rotation
                });
            }

        } else {
            if (ihcolor) {
                image = new ol.style.Circle({
                    radius: this.radius,
                    fill: fill,
                    stroke: stroke,
                    color: ihcolor
                });
            } else {
                image = new ol.style.Circle({
                    radius: this.radius,
                    fill: fill,
                    stroke: stroke
                });
            }

        }


        if (style && (style.text || style.label)) {
            /*let text = style.text ;
            let size=1;
            if(style.size){
                size=style.size;
            }
            return new ol.style.Style({
                image: image,
                fill: fill,
                stroke: stroke,
                text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'middle',
                    font: 'Arial',
                    scale: size,
                    text: text.toString(),
                    fill: new ol.style.Fill({color:style.color}),
                    overflow: false,
                    offsetX: this.offsetX,
                    offsetY: this.offsetY
                })
            });*/
        }
        return new ol.style.Style({
            image: image,
            fill: fill,
            stroke: stroke
        });
    }

    /**
     * 高亮图层获取的颜色
     * @param style
     * @param ihcolor 高亮的颜色
     * @returns {ol.style.Style}
     */
    getHighStyle(style, feature, ihcolor) {
        if (style && style.style) {
            if (Array.isArray(style.style)) {
                let types = style.types;
                let key = feature.get(types);
                for (let i = 0; i < style.style.length; i++) {
                    if (style.style[i].types == key) {
                        return this.getStyle(style.style[i], ihcolor);
                    }
                }
            } else {
                return this.getStyle(style.style, ihcolor);

            }
        } else {
            return this.getStyle(style, ihcolor);
        }
    }

    /**
     * 单独获取一个样式，标会时获取有文字的图标
     * @param style
     * @returns {Style}
     */
    getStyles(style) {
        let scale = 1;
        if (style) {
            if (style.anchor) {
                var as = Array.isArray(style.anchor);
                if (as) {
                    let x = style.anchor[0];
                    let y = style.anchor[1];
                    x = x >= -0.5 ? x <= 1.5 ? x : 1.5 : -0.5;
                    y = y >= -0.5 ? y <= 1.5 ? y : 1.5 : -0.5;
                    this.anchor = [x, y];
                } else {
                    this.anchor = [0.5, 0.5];
                }
            }
            if (style.url) {
                this.url = style.url;
            }
            if (style.fill) {
                this.fill = style.fill;
            }
            if (style.radius) {
                this.radius = style.radius;
            } else {
                this.radius = 5;
            }
            this.radius = this.radius * 0.4;
            if (style.color) {
                this.color = style.color;
            }
            if (style.width >= 0)
                this.width = style.width;
            if (style.scale > 0)
                scale = style.scale;
        }

        let fill;

        if (this.fill) {
            fill = new ol.style.Fill({
                color: this.fill
            });
        } else {
            fill = new ol.style.Fill({
                color: 'rgba(255,255,255,0.4)'
            });
        }

        let stroke = new ol.style.Stroke({
            color: '#37abff',
            width: 1.25
        });

        if (this.width && this.width >= 0) {
            stroke.setWidth(this.width);
        }
        if (this.color) {
            stroke.setColor(this.color);
        }
        //虚线
        if (style && style.lineDash) {
            // lineDash [10,10]
            stroke.setLineDash(style.lineDash);
        }

        let image;

        if (this.url && this.anchor) {

            image = new ol.style.Icon({
                anchor: this.anchor,
                src: this.url,
                scale: scale,
                rotation: this.rotation
            });
        } else if (this.url) {
            image = new ol.style.Icon({
                anchor: [0.5, 0.5],
                src: this.url,
                scale: scale,
                rotation: this.rotation
            });
        } else {
            image = new ol.style.Circle({
                radius: this.radius,
                fill: fill,
                stroke: stroke
            });
        }

        if (style && (style.text || style.label)) {
            let text = style.text ? style.text : style.label;

            let size = 1;
            if (style.size) {
                size = this.text.size;
            }

            return new ol.style.Style({
                image: image,
                fill: fill,
                stroke: stroke,
                text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'middle',
                    font: 'Arial',
                    scale: this.text.scale,
                    text: text.toString(),
                    fill: new ol.style.Fill({color: this.text.color}),
                    overflow: false,
                    offsetX: this.text.offsetX,
                    offsetY: this.text.offsetY
                })
            });
        }
        return new ol.style.Style({
            image: image,
            fill: fill,
            stroke: stroke
        });
    }

    /**
     * 图层样式
     * @param style
     */
    setStyle(style) {
        this.anchor = null;//图片锚点位置
        this.url = null;//图片url
        this.fill = null;//填充颜色
        this.width = null;//线宽
        this.radius = null;//圆半径
        this.color = null;//线颜色
        this.scale = 1;//图片缩放比例

        if (style.rotation) {
            this.rotation = degreetoradian(style.rotation);//图片旋转角度，顺时针方向
        }
        if (style) {
            if (style.types) {
                this.types = style.types;
            }

            if (style.url) {
                this.url = style.url;
            }

            if (style.label) {
                this.label = style.label;
                this.textStyle.label = style.label;
            }

            if (style.text) {
                this.textStyle.setStyle(style.text);
                if (style.text.resolution) {
                    this._resolution = style.text.resolution;//文字的分辨率
                }
            }
            var results;
            if (style && style.style) {
                if (Array.isArray(style.style)) {
                    for (let i = 0; i < style.style.length; i++) {
                        if (style.style[i].types) {
                            this.styleSet[style.style[i].types] = this.getStyle(style.style[i]);
                        } else {
                            this.styleSet["default"] = this.getStyle(style.style[i]);
                        }
                    }
                    results = this.styleFun;
                } else {
                    if (style.label) {
                        this.style = this.getStyle(style.style);
                        results = this.styleFun1;
                    } else {
                        results = this.getStyle(style.style);
                    }
                }
            } else if (style) {
                if (style.rotationlabel) {
                    this.rotationlabel = style.rotationlabel;//根据属性设置图标的角度
                }
                if (style.label || style.rotationlabel) {

                    this.style = this.getStyle(style);
                    results = this.styleFun1;
                } else {
                    results = this.getStyle(style);
                }
                //results = this.getStyle(style);
            }

            if (this.vectorLayer) {
                this.vectorLayer.setStyle(results);
                return results;
            } else {
                return results;
            }
        }
    }
}

export default Styles;
