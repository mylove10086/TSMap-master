import Geometry from "../geom/Geometry";

/**
 * 一个范围限制效果
 */
class MaskFilterLayer {
    constructor(map, id) {
        this.map = map;
        this.source = new ol.source.Vector({wrapX: false});
        this.vectorLayer = new ol.layer.Vector({
            source: this.source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(255,255,255,0)"
                }),
            })
        });
        this.map.addLayer(this.vectorLayer);
        this.defstyle = {
            color: 'rgba(116,112,116,0.5)',
            shadowColor: 'rgba(229,220,229,0.3)',
            shadowWidth: 0,
            inner: false,
            type: "crop"
        }
        this.style = {};
        this.crop = new ol.filter.Crop({
            feature: null,
            wrapX: true,
            inner: false,
            fill: new ol.style.Fill({color: this.defstyle.color})

        });
        this.mask = new ol.filter.Mask({
            feature: null,
            wrapX: true,
            inner: false,
            fill: new ol.style.Fill({color: this.defstyle.color})

        });
        this.vectorLayer.addFilter(this.crop);
        this.vectorLayer.addFilter(this.mask);
    }


    addFeature(object) {
        var feature = Geometry.createFeature(object);
        if (feature) {
            this.source.addFeature(feature);
            var tyle = this.style.type ? this.style.type : this.defstyle.type;
            if (tyle=="mask") {
                this.mask.set('inner',  this.style.inner ? this.style.inner : this.defstyle.inner);
                this.mask.set('shadowWidth', this.style.shadowWidth ? this.style.shadowWidth : this.defstyle.shadowWidth);
                this.mask.setFillColor(this.style.color ? this.style.color : this.defstyle.color);
                this.mask.setShadowColor(this.style.shadowColor ? this.style.shadowColor : this.defstyle.shadowColor);
                this.mask.feature_ = feature;
            }else {
                this.mask.set('inner', false);
                this.crop.set('active', true);
                this.crop.set('shadowWidth', this.style.shadowWidth ? this.style.shadowWidth : this.defstyle.shadowWidth);
                this.crop.setFillColor(this.style.color ? this.style.color : this.defstyle.color);
                this.crop.setShadowColor(this.style.shadowColor ? this.style.shadowColor : this.defstyle.shadowColor);
                this.crop.feature_ = feature;
            }
        }
        return feature;
    };

    setVisible(visible) {
        this.vectorLayer.setVisible(visible);
    };

    getVisible() {
        return this.vectorLayer.getVisible();
    };

    removeLayer() {
        this.map.removeLayer(this.vectorLayer);
        if (this.vectorSource) {
            this.vectorSource.clear();
            this.vectorSource = null;
        }
        this.vectorLayer = null;
    };

    addLayer() {
        if (this.vectorLayer) {
            this.map.removeLayer(this.vectorLayer);
        } else {
            this.vectorLayer = new ol.layer.Vector({
                source: this.source
            });

        }
        this.map.addLayer(this.vectorLayer);
    }

    getFeatureById(id) {
        return null;
    }

    topLayer() {

    };

    /**
     * 清空图层
     */
    clear() {
        this.vectorSource.clear();
    };

    /**
     * 设置图层的样式
     * @param style openlayer的样式对象
     */
    setStyle(style) {
        if (style) {
            this.style = style;
        } else {
            this.style = {};
        }
    };

    /**
     * 图层的单击事件注册
     * @param fun 函数/null 传函数是注册事件，null是移除单击事件
     */
    setClickCallback(fun) {

    }

    setZIndex(index) {
    }
}

export default MaskFilterLayer;