import '../../../assets/css/Animate.css';
import {extend, hasUndefined} from "../../../common/util";
import Styles from "../style/Styles";

class AnimateLayer {
    constructor(map, options) {

        if (hasUndefined(map)) {
            return;
        }
        this.map = map;
        this.flightsSource = new ol.source.Vector({
            wrapX: false
        });

        this.flightsLayer = new ol.layer.Vector({
            source: this.flightsSource
        });
        //圆放大
        this.point_div = document.createElement('div');
        this.point_div.className = "css_animation";
        this.point_overlay = new ol.Overlay({
            element: this.point_div,
            positioning: 'center-center'
        });
        map.addOverlay(this.point_overlay);
        let that = this;


        //圆圈放大
        this.source = new ol.source.Vector({wrapX: false});
        this.vector = new ol.layer.Vector({
            source: this.source,
        });
        map.addLayer(this.vector);
        let zindex = map.getLayers().getLength();
        this.vector.setZIndex(zindex);
        map.on('singleclick', function (evt) {
            let coordinate = evt.coordinate;
            that.point_overlay.setPosition(coordinate);
            let geom = new ol.geom.Point(coordinate);
            let feature = new ol.Feature(geom);
            that.source.addFeature(feature);
        });
        let duration = 3000;

        function flash(feature) {
            let start = new Date().getTime();
            let listenerKey = that.vector.on('postrender', animate);

            function animate(event) {
                let vectorContext = ol.render.getVectorContext(event);
                let frameState = event.frameState;
                let flashGeom = feature.getGeometry().clone();
                let elapsed = frameState.time - start;
                let elapsedRatio = elapsed / duration;
                // radius will be 5 at start and 30 at end.
                let radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
                let opacity = ol.easing.easeOut(1 - elapsedRatio);

                let style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255, 25, 100, ' + opacity + ')',
                            width: 0.25 + opacity,
                        }),
                    }),
                });

                vectorContext.setStyle(style);
                vectorContext.drawGeometry(flashGeom);
                if (elapsed > duration) {
                    ol.Observable.unByKey(listenerKey);
                    start = new Date().getTime();
                    return;
                }
                // tell OpenLayers to continue postrender animation
                that.map.render();
            }
        }

        that.source.on('addfeature', function (e) {
            flash(e.feature);
        });

        //流动线
        let outlineStroke = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [25, 25, 255, 1],
                width: 5,
            })
        });
        let sourcele = new ol.source.Vector({wrapX: false});
        this.vectorle = new ol.layer.Vector({
            source: sourcele,
            style: function (feature) {
                let s = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: [255, 255, 255, 1],
                        width: 5,
                        lineDash: [17, 170],
                        lineDashOffset: feature.get('dashOffset')
                    })
                });
                let s1 = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: [0, 255, 255, 1],
                        width: 5,
                        lineDash: [17, 170],
                        lineDashOffset: -feature.get('dashOffset')
                    })
                });
                let offset = feature.get('dashOffset');
                offset = offset === 170 ? 0 : offset + 1;
                feature.set('dashOffset', offset);
                return [outlineStroke, s, s1];

            }
            //style: styles
        });
        this.vectorSource=sourcele;
        map.addLayer(this.vectorle);


        //点在线上移动
        map.addLayer(this.flightsLayer);

        let style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#EAE911',
                width: 2,
            }),
        });
        let style1 = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 2 * 2,
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255,1)'
                })
            })
        });


        this.animateFlights = function (event) {
            let vectorContext = ol.render.getVectorContext(event);
            vectorContext.setStyle(style1);

            let features = that.flightsSource.getFeatures();
            for (let i = 0; i < features.length; i++) {
                let feature = features[i];
                //if (!feature.get('finished')) {
                // only draw the lines for which the animation has not finished yet
                let coords = feature.getGeometry().getCoordinates();
                let index = feature.get('start', 0);
                if (index === coords.length) {
                    feature.set('start', 0);
                    index = 0
                }
                let currentLine = new ol.geom.Point(coords[Math.floor(index)]);
                feature.set('start', index + 1);
                // directly draw the line with the vector context
                vectorContext.drawGeometry(currentLine);
                //}
            }
            map.render();
        };

        this.feature = null;

        this.Animate = function () {
            let arcGenerator = new arc.GreatCircle(
                {x: 113, y: 23},
                {x: 114, y: 23.5}
            );
            let arcLine = arcGenerator.Arc(100, {offset: 10});
            let line = new ol.geom.LineString(arcLine.geometries[0].coords);
            //line.transform('EPSG:4326', 'EPSG:3857');

            that.feature = new ol.Feature({
                geometry: line,
                finished: false,
            });
            that.feature.set('start', 0);
            this.flightsSource.addFeature(that.feature);

            var arra = [];
            var lon = 113;
            var lat = 23;

            for (var j = 0; j < 50; j++) {
                arra.push([lon, lat]);
                lat += 0.001;
                lon += 0.001;
            }
            for (var j = 0; j < 50; j++) {
                arra.push([lon, lat]);
                lat += 0.001;

            }
            var ls = new ol.geom.LineString(arra);
            let featurele = new ol.Feature({
                geometry: ls,
                dashOffset: 0
            });
            sourcele.addFeature(featurele);
        };
    }

    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    setVisible(visible) {
        this.flightsLayer.setVisible(visible);
        this.vector.setVisible(visible);
        this.vectorle.setVisible(visible);
    };

    getVisible() {
        return this.flightsLayer.getVisible();
    };

    /**
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    getFeatureById(id) {
        return null;
    }

    length() {
        return 0;
    }


    startAnimate() {
        if (!this.feature) {
            this.Animate();
        }
        this.flightsLayer.on('postrender', this.animateFlights);
        this.map.render();
    };

    stopAnimate() {

        this.flightsLayer.un('postrender', this.animateFlights);
        this.point_overlay.setPosition(null);

    };

    removeAnimate() {

    }
    clear() {
        this.vectorSource.clear();
    };
    /**
     * 设置图层的样式
     * @param style openlayer的样式对象
     */
    setStyle(style) {

    };

    /**
     * 图层的单击事件注册
     * @param fun 函数/null 传函数是注册事件，null是移除单击事件
     */
    setClickCallback(fun) {

    }

    setMoveCallback(fun) {

    }

    contains(feature) {
    }
    /**
     * 0 移动到最底层
     * 1 上移一层
     * 2 移动到最顶层
     * -1 下移一层
     * @param index
     */
    setZIndex(index) {

    }
}

export default AnimateLayer;
