/**
 * 电线面对样式
 */

class TestStyle {

    constructor() {
        this.color = '#ffffff';//线颜色
        this.scale = 1;//图片缩放比例
        this.offsetX = 0;//字体x偏移
        this.offsetY = 0;//字体x偏移
        this.label = null;
        this.resolution = 0.05;
        this.overflow = false;
        this.textAlign = "center";
        this.textBaseline = "middle";
        this.stroke = null;
        this.background = null;
        this.padding = null;
        //描边
        this.outlineColor = null;
        this.outlineWidth = null;

        let _this = this;

        this.getText = function (feature) {
            let text = feature.get(_this.label);
            /*if (resolution > _this.resolution) {
                text = '';
            }*/
            return text;
        }
    }

    setStyle(obj) {

        this.color = obj.color ? obj.color : '#ffffff';

        if (obj.distance) {
            this.distance = obj.distance;
            this.textdistance = obj.distance
        } else {
            this.distance = null
            this.textdistance = null;

        }
        if (obj.background) {
            this.background = obj.background;
        }
        if (obj.stroke) {
            this.stroke = obj.stroke;
        }
        if (obj.padding) {
            this.padding = obj.padding;
        }
        if (obj.scale) {
            this.scale = obj.scale ? obj.scale : 1;
        }
        this.offsetX = obj.offsetX ? parseFloat(obj.offsetX) : 0;
        this.offsetY = obj.offsetY ? parseFloat(obj.offsetY) : 0;
        if (obj.overflow) {
            this.overflow = obj.overflow;
        }
        if (obj.outlineColor) {
            this.outlineColor = obj.outlineColor;
        }
        if (obj.outlineWidth) {
            this.outlineWidth = obj.outlineWidth;
        }
        if (obj.resolution) {
            this._resolution = obj.resolution;//文字的分辨率
        }
    }

    createTextStyle(feature, resolution) {

        var text = this.getText(feature, resolution);
        var st = this.getTextFun(text);
        return st;
    }

    getStyle(feature, resolution) {
        return new ol.style.Style({
            text: this.createTextStyle(feature, resolution)
        });
    };

    // 获取样式
    getTextFun(text,textcolor) {
        let backgroundFill = null;
        if (this.background) {
            backgroundFill = new ol.style.Fill({color: this.background});
        }
        let stroke = null;
        if (this.stroke) {
            stroke = new ol.style.Stroke({
                color: this.stroke.color,
                width: this.stroke.width
            });
        }
        let padding = [0, 0, 0, 0];
        if (this.padding) {
            padding = this.padding
        }
        var color=this.color;
        if(textcolor){
            color=textcolor;
        }

        var obj = {
            textAlign: this.textAlign,
            textBaseline: this.textBaseline,
            backgroundFill: backgroundFill,
            backgroundStroke: stroke,
            padding: padding,
            font: 'Arial',
            scale: this.scale * 2.5,// 为了与ceisum一致
            overflow: this.overflow,
            text: text,
            fill: new ol.style.Fill({color: color}),
            offsetX: this.offsetX,
            offsetY: -this.offsetY
        };
        if (this.outlineColor) {
            obj.stroke = new ol.style.Stroke({
                color: this.outlineColor,
                width: this.outlineWidth > 0 ? this.outlineWidth * 0.5 : 1
            })
        }

        return new ol.style.Text(obj);
    }

    setText(text) {
        var obj = {
            textAlign: this.textAlign,
            textBaseline: this.textBaseline,
            font: 'Arial',
            scale: this.scale * 2.5,// 为了与ceisum一致
            overflow: this.overflow,
            text: text,
            fill: new ol.style.Fill({color: this.color}),
            offsetX: this.offsetX,
            offsetY: -this.offsetY
        };
        if (this.outlineColor) {
            obj.stroke = new ol.style.Stroke({
                color: this.outlineColor,
                width: this.outlineWidth > 0 ? this.outlineWidth * 0.5 : 1
            })
        }

        return new ol.style.Style({
            text: new ol.style.Text(obj)
        });
    }
}

export default TestStyle;
