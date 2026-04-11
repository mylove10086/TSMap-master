/**
 * 要素图层,用于查询
 * @param map 初始化的map
 * @returns {*} 返回创建的要素图层
 * @constructor
 */
import Styles from "../style/Styles";
import {extend, hasUndefined} from "../../../common/util";

class FeatureLayer {
    constructor(map, options) {
        options = options ? options : {};
        this._id = options.id;
        this.map = map;
        if (hasUndefined(this.map)) {
            return;
        }
        this.vectorSource = new ol.source.Vector({wrapX: false});
        this.vector = new ol.layer.Vector({
            source: this.vectorSource

        });
        map.addLayer(this.vector);

        /**
         * 注意这个值必须为创建工作区时的命名空间URI
         * @type {null}
         */
        this.featureNS = null;//
        /**
         * 工作区的命名
         * @type {null}
         */
        this.featurePrefix = null;//
        /**
         * 查询的图层
         * @type {[]}
         */
        this.featureTypes = [];//
        /**
         * 返回的结果数
         * @type {number}
         */
        this.maxFeatures = 50;//
        /**
         * 空间参考坐标系
         * @type {string}
         */
        this.epsg = "4326";//
        /**
         * 查询的几何列
         * @type {string}
         */
        this.geom = "geom";//
        /**
         * 查询的地址
         * @type {null}
         */
        this.url = null;//
        /**
         * 绘图工具draw返回的getFeature函数返回的值
         * @type {null}
         */
        this.feature = null;//
        /**
         * 如：ol.format.filter.like('NAME', 'museam')
         * @type {null}
         */
        this.filters = null;
        this.callback = function (e) {

        };
    }

    /**
     * 属性和多边形查询
     */
    createQuery() {
        //if (this.featureNS && this.featurePrefix && this.featureTypes.length > 0 && this.url) {
        if (this.featureTypes.length > 0 && this.url) {
            let filter = null;
            if (this.feature) {
                let geo = this.feature.getGeometry();
                let ty = geo.getType();
                if (ty === "Polygon")
                    filter = ol.format.filter.intersects(this.geom, this.feature.getGeometry());//相交查询
                else
                    this.feature = null;

            }
            if (this.filters) {
                filter = this.filters;
            }
            if (this.feature && this.filters) {
                filter = ol.format.filter.and(
                    ol.format.filter.intersects(this.geom, this.feature.getGeometry()),
                    this.filters
                );
            }
            let featureRequest = new ol.format.WFS().writeGetFeature({
                srsName: 'EPSG:' + this.epsg,//坐标系
                featureNS: this.featureNS,// 注意这个值必须为创建工作区时的命名空间URI
                featurePrefix: this.featurePrefix,//工作区的命名
                featureTypes: this.featureTypes,//
                //maxFeatures: this.maxFeatures,//返回的数量
                outputFormat: 'application/json',//返回的格式
                //filter: ol.format.filter.intersects("geom", feature.getGeometry(), 'EPSG:4326')//多了EPSG:4326的会返回错误
                //filter: ol.format.filter.intersects(this.geom, this.feature.getGeometry())//相交查询
                /* filter: ol.format.filter.and(
               ol.format.filter.like('NAME', 'museam'),
               ol.format.filter.equalTo('waterway', 'riverbank'))*///多个条件联合在一起
                filter: filter
            });
            let that = this;

            fetch(this.url, {
                method: 'POST',
                body: new XMLSerializer().serializeToString(featureRequest)
                //body: us
            }).then(function (response) {
                return response.json();
                //return response.text();
            }).then(function (json) {
                let features = new ol.format.GeoJSON().readFeatures(json);
                that.callback(features);
                //console.log(json);
            });
        }
    };

    /**
     * 获取创建的矢量源
     * @returns {*}
     */
    getSourceVector() {
        return this.vectorSource;
    };

    /**
     * 清除所有要素
     */
    clearFeature() {
        this.vectorSource.clear();
    };

    /**
     * 添加查询结果的要素
     * @param e 由query查询的结果
     */
    addFeature(e) {

        if (e.length > 0) {
            this.vectorSource.clear();
            this.vectorSource.addFeatures(e);
        } else {
            console.log("没有返回要素");
        }

    };

    /**
     * 设置图层的可见性
     * @param object{visible:true/false}
     */
    setVisible(object) {
        this.vector.setVisible(object.visible);
    };

    /**
     * 获取显示在地图上的查询结果
     * @returns [] 一个图形数据
     */
    getFeatures() {
        return this.vectorSource.getFeatures();
    };

    /**
     * 设置查询的回调函数
     * @param fun
     */
    callbackFun(fun) {
        this.callback = fun;
    };

    /**
     * 设置图层的样式
     * @param opt_style openlayer的样式对象
     */
    setStyle(opt_style) {
        /*this.anchor = null;//图片锚点位置
       this.url = null;//图片url
       this.fill = null;//填充颜色
       this.width = null;//线宽
       this.radius = null;//圆半径
       this.color = null;//线颜色
       this.scale = 1;//图片缩放比例
       this.rotation = 0;//图片旋转角度，顺时针方向*/
        if (opt_style) {
            if (this.vector) {
                if (!this.defaultStyle) {
                    this.defaultStyle = new Styles();
                }
                this.vector.setStyle(this.defaultStyle.getStyle(opt_style));
            }
        } else {
            return;
        }
    };
}

export default FeatureLayer;
