/**
 * Created by  on 2021/7/1.
 */

import Draw from "../interaction/Draw";
import Styles from "../style/Styles";
import TestStyle from "../style/TestStyle";
import {GraphicType} from "../../../map/TsMapConstants";
import Algorithm from "../common/algorithnm/Algorithm";

function DraughtDraw(map) {

    let darw = new Draw(map, {
        selectStyle: true
    });

    let styleSet = new Styles();
    let testStyle = new TestStyle();

    darw.setDrawEndCallback(funs);

    let attribute = null;
    let style = null;
    let type = null;
    let label = null;
    let textFeature = null;// 编辑时文字的要素
    let that = this;

    function funs(e, f) {
        switch (f.action) {
            case 'add':
                e.setStyle(setStyle(style, type));
                attribute.gid = f.gid;
                var attr = {
                    gid: f.gid,
                    attribute: attribute,
                    style: style,
                    graphicType: type
                };
                e.setProperties(attr);
                break;
            case 'select':
                if (e.get("graphicType") === "Text") {
                    textFeature = e;
                }
                return;
                break;
            case "modify":

                break;
        }
        var atr = e.getProperties();

        var resulte = {
            attribute: atr.attribute,
            style: atr.style,
            type: atr.graphicType,
            coordinates: f.coordinate,
            controlPoint: f.controlPoint
        };
        if (label) {
            resulte.style.label = label;
        }
        type = null;
        textFeature = null;
        label = null;
        if (that.callbackFun)
            that.callbackFun(resulte);
    }

    function setStyle(obj, t) {
        var results;
        switch (t) {
            case "Text":
                testStyle.setStyle({
                    color: obj.color,
                    scale: obj.size,
                    offsetX: obj.offsetX,
                    offsetY: obj.offsetY,
                });
                let tt = (obj.label === null || obj.label === undefined) ? "" : obj.label;
                if (tt === "") {
                    tt = (obj.text === null || obj.text === undefined) ? "" : obj.text;
                }
                results = testStyle.setText(tt);
                break;
            case "Point":
                styleSet.init();
                styleSet.setText({
                    color: obj.color,
                    scale: obj.size,
                    offsetX: obj.offsetX,
                    offsetY: obj.offsetY,
                });

                results = styleSet.getStyles(obj);

                //results = styleSet.setText(obj.label === null ? "" : obj.label);
                break;
            default:
                styleSet.init();
                results = styleSet.getStyle(obj);
                break;

        }

        return results;
    }

    this.drawGraphic = function (obj) {
        label = null;
        textFeature = null;
        attribute = obj.attribute;
        if (!attribute) {
            attribute = {};
        }
        if (obj.type)
            type = obj.type;
        switch (obj.type) {
            case "Text":
                darw.drawGraphic("Point");
                break;
            case "Point":
                darw.drawGraphic("Point");
                break;
            case "LineString":
                darw.drawGraphic("LineString");
                break;
            case "Polygon":
                darw.drawGraphic("Polygon");
                break;
            case "FineArrow":
                darw.drawGraphic("FineArrow");
                break;
            case "AttackArrow":
                darw.drawGraphic("AttackArrow");
                break;
            case "PincerArrow":
                darw.drawGraphic("PincerArrow");
                break;
            case "Box":
                darw.drawGraphic("Box");
                break;
            case "Square":
                darw.drawGraphic("Square");
                break;
            case "Circle":
                darw.drawGraphic("Circle");
                break;

        }
        if (obj.style)
            style = obj.style;
        else
            style = null;
    }
    this.addFeature = function (obj) {
        if (obj && obj.type && obj.coordinates && obj.attribute && obj.attribute.gid) {
            let type = obj.type;
            let coordinates = null;
            let tt = null;
            switch (obj.type) {
                case "Text":
                case "Point":
                    type = "Point";
                    coordinates = obj.coordinates;
                    /* tt = (obj.style.label === null || obj.style.label === undefined) ? null : obj.style.label;
                     if (!tt) {
                         tt = (obj.style.text === null || obj.style.text === undefined) ? null : obj.style.text;
                     }*/
                    break;
                case "LineString":
                    type = "LineString";
                    coordinates = obj.coordinates;
                    break;
                case "Polygon":
                case "Box":
                case "Square":
                case "FineArrow":
                case "Circle":
                case "AttackArrow":
                case "PincerArrow":
                    type = "Polygon";
                    coordinates = obj.coordinates;
                    break;
            }
            let graphic = {
                "geometry": {
                    "type": type,
                    "coordinates": coordinates
                }, "properties": {
                    attribute: obj.attribute,
                    gid: obj.attribute.gid
                }
            };

            let feature = darw.vectorLayer.addFeature(graphic);
            if (obj.controlPoint) {
                feature.set("controlPoint", obj.controlPoint);
            }
            let style;
            if (obj.style != null) {
                style = setStyle(obj.style, obj.type);
                feature.setStyle(style);
            }

            feature.set("style", obj.style);
            //feature.set("type", obj.type);
            feature.set("graphicType", obj.type);
            if (feature)
                feature.setStyle(style);
        }
    }
    /**
     * 选择修改图形
     * @param type
     */
    this.modifyGraphic = function (type) {
        textFeature = null;
        label = null;

        darw.modifyGraphic(type);
    }
    this.selectGraphic = function () {

    }
    this.getFeatureById = function (id) {
        return darw.getFeatureById(id);
    }
    this.removeFeature = function (f) {
        return darw.removeFeature(f);
    }
    this.clear = function (f) {
        return darw.clear(f);
    }

    /**
     * 修改文字
     * @param text
     */
    this.modifyText = function (text) {
        if (textFeature) {
            if (text) {
                var textStyle = textFeature.getStyle().getText();
                if (textStyle) {
                    let tt = (text.label === null || text.label === undefined) ? "" : text.label;
                    if (tt === "") {
                        tt = (text.text === null || text.text === undefined) ? "" : text.text;
                    }
                    if (tt === "") {
                        tt = text;
                    }
                    label = tt;
                    tt !== "" ? textStyle.setText(tt) : "";
                    darw.changed();
                }
            }
        } else if (text && text.gid && text.label) {
            var feature = this.getFeatureById(text.gid);
            var textStyle = feature.getStyle().getText();
            if (textStyle) {
                let tt = (text.label === null || text.label === undefined) ? "" : text.label;
                if (tt === "") {
                    tt = (text.text === null || text.text === undefined) ? "" : text.text;
                }
                if (tt === "") {
                    tt = text;
                }
                label = tt;
                tt !== "" ? textStyle.setText(tt) : "";
                darw.changed();
            }
        }

    }

    this.setCallback = function (fun) {
        this.callbackFun = fun;
    }
    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    this.setVisible = function (visible) {
        darw.vectorLayer.setVisible(visible);
    };
    this.getVisible = function () {
        return darw.vectorLayer.getVisible();
    };
    this.setZIndex = function (index) {

    }

}

export default DraughtDraw;