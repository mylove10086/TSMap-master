import '../../../assets/css/Animate.css';
import {extend, hasUndefined} from "../../../common/util";
import Styles from "../style/Styles";

class PointAnimateLayer {
    constructor(map, options) {
        this.map = map;
        if (hasUndefined(map)) {
            return;
        }
        this.vectorSource = new ol.source.Vector({});
        this.vectorLayer = new ol.layer.Vector({
            source: this.vectorSource,
            style: timefun
        });
        this.metersPerUnit = this.map.getView().getProjection().getMetersPerUnit();
        this.map.addLayer(this.vectorLayer);
        this.styleSet = new Styles();
        this.stylePoint = this.styleSet.getStyle();
        let that = this;

        function timefun(f) {
            let step = f.get('step');
            f.getGeometry().setRadius(step);
            step = step + f.get('radius');
            if (step > f.get('base')) {
                step = 0;
            }
            f.set('step', step);

            return that.stylePoint;
        }

    }

    addFeature(object) {
        let geometry = object.geometry ? object.geometry : null,
            coords = geometry ? geometry.coordinates : null;
        if (!coords && !geometry) {
            return null;
        }
        let attr = null;
        if (object && object.properties) {
            attr = object.properties;
        }
        let radius = 100;
        if (!geometry.radius) {
            return;
        }
        let step = 50;
        if (geometry.step) {
            step = geometry.step;
        }
        radius = geometry.radius;
        let g = null;

        var circleRadius = radius / this.metersPerUnit;
        let cricle = new ol.geom.Circle(coords, 0);

        var feature = new ol.Feature({
            geometry: cricle,
        });
        feature.set('radius', circleRadius / step);
        feature.set('step', 0);
        feature.set('base', circleRadius);


        this.vectorSource.addFeature(feature);
        if (g) {
            if (attr)
                g.attribuite = attr;
            this.coordinates = g.getGeometry().getCoordinates();
            this.vectorSource.addFeature(g);
        }

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
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    getFeatureById(id) {
        if (this.vectorSource)
            return this.vectorSource.getFeatureById(id);
        return null
    }

    length() {
        if (this.vectorSource)
            return this.vectorSource.getFeatures().length;
        return 0;
    }

    /**
     * 移除图层,移除后需要用 setDataSource从新添加
     */
    removeLayer() {
        this.removeClick();
        this.moveClick();

        this.map.removeLayer(this.vectorLayer);
        if (this.vectorSource) {
            this.vectorSource.clear();
            this.vectorSource = null;
        }
        this.vectorLayer = null;
    }

    /**
     * 添加图层
     */
    addLayer() {
        if (this.vectorLayer) {
            this.map.removeLayer(this.vectorLayer);
        } else {
            this.vectorLayer = new ol.layer.Vector({
                source: this.vectorSource
            });

        }
        this.map.addLayer(this.vectorLayer);
    }

    /**
     * 设置图层的样式
     * @param style openlayer的样式对象
     */
    setStyle(style) {
        /*this.anchor = null;//图片锚点位置
       this.url = null;//图片url
       this.fill = null;//填充颜色
       this.width = null;//线宽
       this.radius = null;//圆半径
       this.color = null;//线颜色
       this.scale = 1;//图片缩放比例
       this.rotation = 0;//图片旋转角度，顺时针方向*/
        if (!this.styleSet) {
            this.styleSet = new Styles();
        }
        this.stylePoint = this.styleSet.setStyle(style);
    };
    removeClick() {
        if (this._removefun) {
            this._removefun();
            this._removefun = null;
            this._clickCallback = null;
        }
    }
    setClickCallback(fun) {
        this.removeClick();

        if (fun) {
            this._removefun = this.map._event.addEventListener(fun, this);
            this._clickCallback = fun;
        }
    }
    moveClick() {
        if (this._removefun1) {
            this._removefun1();
            this._removefun1 = null;
            this._clickCallback1 = null;
        }
    }
    setMoveCallback(fun) {
        this.moveClick();

        if (fun) {
            this._removefun1 = this.map._eventMove.addEventListener(fun, this);
            this._clickCallback1 = fun;
        }
    }

    contains(feature) {
        return this.vectorSource.hasFeature(feature);
    }

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

}

export default PointAnimateLayer;
