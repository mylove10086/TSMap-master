/**
 * echarts的交通图
 */
import * as echarts from 'echarts';

function FlowLayer(map) {
    var dimensional = true;// 三维，二维

    if (map instanceof ol.Map) {
        dimensional = false;
    } else {
        return;
    }

    this._color = "#93f3e8";

    this._map = map;
    this._ecOptions;
    this._style = null;

    this._registered = false;
    this._container = null;
    this.zIndex = 999;
    this._container = null;
    this._echarts = echarts;
    this.event = null;
    this.isReady = true;
    this._id = Date.parse(new Date());

    let that = this;

    function createEcOptions() {
        return {
            animation: !1,
            GLMap: {},
            series: [
                {
                    type: 'lines',
                    coordinateSystem: 'GLMap',
                    polyline: true,
                    data: [],
                    silent: true,
                    lineStyle: {
                        //color: '#c23531',
                        //color: 'rgb(200, 35, 45)',
                        opacity: 0.2,
                        width: 2
                    },
                    progressiveThreshold: 500,
                    progressive: 200
                },
                {
                    type: 'lines',
                    coordinateSystem: 'GLMap',
                    polyline: true,
                    data: [],
                    lineStyle: {
                        width: 0
                    },
                    effect: {
                        constantSpeed: 20,
                        show: true,
                        trailLength: 0.1,
                        symbolSize: 2.5
                    },
                    zlevel: 1
                }
            ]
        };
    }

    this._ecOptions = createEcOptions();
    this.getMap = function () {
        return this._map;
    };

    this._isVisible = function () {
        return this._container && this._container.style.display === '';
    };

    this._render = function () {
        if (!this._ecOptions) {
            return;
        }
        if (!this._container) {
            this._createLayerContainer();
        }
        if (!this._ec) {
            this._ec = this._echarts.init(this._container);
            this._prepareECharts();
            this._ec.setOption(this._ecOptions, false);
        } else if (this._isVisible()) {
            this._ec.resize();
        }
        this._bindEvent();
    }

    this.readyStart = function () {
        that.isReady = true;
    };

    this.readyEnd = function () {
        that.isReady = false;
    };
    this._bindEvent = function () {
        this.event = this._moveHandler("onMoveEnd");
        if (dimensional) {
            // 三维
            this._map.scene.postRender.addEventListener(this.event)
            this._map.scene.camera.moveEnd.addEventListener(this.readyEnd);
            this._map.scene.camera.moveStart.addEventListener(this.readyStart);
        } else {
            //二维
            this._map.on('postrender', this.event);
            this._map.getView().on('change:resolution', this.event);
        }

    };

    this._moveHandler = function (type) {
        var _this = this;

        return _this[type].bind(this);
    }
    this._prepareECharts = function () {
        if (!this._registered) {
            this._echarts.registerCoordinateSystem('openlayers', this._getE3CoordinateSystem(this.getMap()));
            this._registered = true;
        }
        var series = this._ecOptions.series;
        if (series) {
            for (var i = series.length - 1; i >= 0; i--) {
                series[i]['coordinateSystem'] = 'openlayers';
                series[i]['animation'] = false;
            }
        }
    };

    this._createLayerContainer = function () {
        var size = [0, 0];
        if (dimensional) {
            var container1 = this._map.container;
            var width = container1.clientWidth;
            var height = container1.clientHeight;
            size = [height, width];
        } else {
            size = this._map.getSize();
        }
        var container = this._container = FlowLayer.Element.createDiv(this._id, {
            height: size[1] + 'px',
            width: size[0] + 'px',
            top: '0px',
            left: '0px',
            zIndex: 999
        });
        if (dimensional) {
            container.style.pointerEvents = 'none';

        }
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        this._resetContainer();
        if (dimensional) {
            this._map.container.appendChild(this._container);
        } else {
            this._map.getViewport().appendChild(this._container);

        }
    };

    this._resetContainer = function () {
        var size;
        if (dimensional) {
            var container = this._map.container;
            size = {
                width: container.clientWidth,
                height: container.clientHeight,
            };
        } else {
            size = this._map.getSize();
        }
        this._container.style.width = size.width + 'px';
        this._container.style.height = size.height + 'px';
    };

    this._getE3CoordinateSystem = function (map) {
        var CoordSystem = function CoordSystem(map, echart) {
            this.map = map;
            this._mapOffset = [0, 0];
            this._echarts = echart;
        };

        CoordSystem.create = function (ecModel) {
            ecModel.eachSeries(function (seriesModel) {
                if (seriesModel.get('coordinateSystem') === 'openlayers') {
                    seriesModel.coordinateSystem = new CoordSystem(map, that._echarts);
                }
            });
        };

        CoordSystem.getDimensionsInfo = function () {
            return ['lng', 'lat'];
        };

        CoordSystem.dimensions = ['lng', 'lat'];

        CoordSystem.prototype.dimensions = ['lng', 'lat'];
        CoordSystem.prototype.setMapOffset = function setMapOffset(mapOffset) {
            this._mapOffset = mapOffset;
        };
        CoordSystem.prototype.dataToPoint = function dataToPoint(data) {
            //地理坐标转为屏幕坐标
            //console.log(data);
            if (dimensional) {
                var scene = this.map.scene;
                var n = [0, 0];
                var r = Cesium.Cartesian3.fromDegrees(data[0], data[1]);
                if (!r)
                    return n;
                if (scene.mode === Cesium.SceneMode.SCENE3D && Cesium.Cartesian3.angleBetween(scene.camera.position, r) > Cesium.Math.toRadians(80))
                    return [];
                var i = scene.cartesianToCanvasCoordinates(r);
                return i ? [i.x - this._mapOffset[0], i.y - this._mapOffset[1]] : n
            } else {
                var px = this.map.getPixelFromCoordinate(data);
                var mapOffset = this._mapOffset;
                return [px[0] - mapOffset[0], px[1] - mapOffset[1]];
            }
        };
        CoordSystem.prototype.pointToData = function pointToData(pt) {
            //屏幕坐标转为地理坐标
            if (dimensional) {
                var t = this._mapOffset;
                var r = new Cesium.cartesian3(pt[1] + t, pt[2] + t[2], 0);
                var cartographic = this.map.scene.globe.ellipsoid.cartesianToCartographic(r);
                return [cartographic.longitude, cartographic.latitude];
            } else {
                var mapOffset = this._mapOffset;
                var data = this.map.containerPointToCoordinate({
                    x: pt[0] + mapOffset[0],
                    y: pt[1] + mapOffset[1]
                });
                return [data.x, data.y];
            }

        };
        CoordSystem.prototype.getViewRect = function getViewRect() {
            var size;
            if (dimensional) {
                var container = this.map.container;
                size = {
                    width: container.clientWidth,
                    height: container.clientHeight,
                };
            } else {
                var container = this.map.getSize();
                size = {
                    width: container[0],
                    height: container[1],
                };
            }
            return new this._echarts.graphic.BoundingRect(0, 0, size.width, size.height);
        };
        CoordSystem.prototype.getRoamTransform = function getRoamTransform() {
            return this._echarts.matrix.create();
        }
        return CoordSystem;
    };

    this.getEvents = function () {
        return {
            '_zoomstart': this.onZoomStart,
            '_zoomend': this.onZoomEnd,
            '_dragrotatestart': this.onDragRotateStart,
            '_dragrotateend': this.onDragRotateEnd,
            '_movestart': this.onMoveStart,
            '_moveend': this.onMoveEnd,
            '_resize': this._resetContainer
        };
    };

    this._clearAndRedraw = function () {
        if (this._container && this._container.style.display === 'none') {
            return;
        }
        this._ec.clear();
        this._ec.resize();
        this._prepareECharts();
        this._ec.setOption(this._ecOptions, false);
    };

    this.onZoomStart = function () {

    };

    this.onZoomEnd = function () {
        this._clearAndRedraw();
    };

    this.onDragRotateStart = function () {

        this.hide();
    };

    this.onDragRotateEnd = function () {

        this._clearAndRedraw();
    };

    this.onMoveStart = function () {

        this.hide();
    };

    this.show = function (visible) {
        if (this._container) {
            if (visible) {
                this._container.style.display = '';
            } else {
                this._container.style.display = 'none';

            }
        }
    };

    this.onMoveEnd = function () {
        if (dimensional) {
            if (this.isReady) {
                this._ec.setOption(this._ecOptions, false);
            }
        } else {
            this._ec.setOption(this._ecOptions, false);

        }
    };

    this.clear = function () {
        this._ec.dispose();
        if (dimensional) {
            this._map.scene.postRender.removeEventListener(this.event)
            this._map.scene.camera.moveEnd.removeEventListener(this.readyEnd);
            this._map.scene.camera.moveStart.removeEventListener(this.readyStart);
            this._map.container.removeChild(this._container);
        } else {
            this._map.un('postrender', this.event);
            this._map.getView().un('change:resolution', this.event);
            this._map.getViewport().removeChild(this._container);
        }
        this._container = null;
        this._ec = null;
        this._ecOptions = null;
    }
    this.addData = function (data) {
        //保证地图渲染完成才执行专题图渲染，且只执行一次
        //this._map.once('postrender', this._render.bind(this));
        if (!data) {
            return;
        }
        this._ecOptions = data;
        this._render();

    };
    this.addFeature = function (object) {
        //保证地图渲染完成才执行专题图渲染，且只执行一次
        let geometry = object.geometry ? object.geometry : null,
            coords = geometry ? geometry.coordinates : null;
        if (!coords && !geometry) {
            return null;
        }

        if (!this._ecOptions) {
            this._ecOptions = createEcOptions();
            this.setStyle(this._style);
        }
        if (!this._ec) {
            var item = {
                coords: coords,
                lineStyle: {
                    normal: {
                        color: geometry.color ? geometry.color : this._color
                    }
                }
            }
            this._ecOptions.series[0].data.push(item);
            this._ecOptions.series[1].data.push(item);
            this._render();

        } else {
            var item = {
                coords: coords,
                lineStyle: {
                    normal: {
                        color: geometry.color ? geometry.color : this._color
                    }
                }
            }
            this._ecOptions.series[0].data.push(item);
            this._ecOptions.series[1].data.push(item);
            /*this._ec.appendData({
                seriesIndex: 0,
                data: [item],
            });
            this._ec.appendData({
                seriesIndex: 1,
                data: [item],
            });*/
            //this._ec.resize();
            this.onMoveEnd();
        }

    }

    this.addFeatures = function (object) {

        if (!this._ecOptions) {
            this._ecOptions = createEcOptions();
            this.setStyle(this._style);
        }
        this._ecOptions.series[0].data = [];
        this._ecOptions.series[1].data = [];
        var length = object.length;
        for (var i = 0; i < length; i++) {
            var item=object[i];
            let geometry = item.geometry ? item.geometry : null,
                coords = geometry ? geometry.coordinates : null;
            if (!coords && !geometry) {
                continue;
            }
            var item = {
                coords: coords,
                lineStyle: {
                    normal: {
                        color: geometry.color ? geometry.color : this._color
                    }
                }
            }
            this._ecOptions.series[0].data.push(item);
            this._ecOptions.series[1].data.push(item);
        }
        this._render();
    }
    this.setZIndex = function (index) {

    }
    this.setStyle = function (style) {
        if (style) {
            this._ecOptions.series[0].lineStyle.width = style.width ? parseFloat(style.width) : 2;
            this._ecOptions.series[0].lineStyle.opacity = style.opacity ? parseFloat(style.opacity) : 0.2;
            this._ecOptions.series[1].effect.symbolSize = style.width ? parseFloat(style.width) + 0.5 : 2.5;
            this._color = style.color ? style.color : "#93f3e8";
            this._style = style;
        }
    }
}

FlowLayer.Element = {
    /**
     * 创建绝对定位div
     * @param id div id
     * @param style 样式的对象
     */
    createDiv: function (id, style) {
        if (!id) {
            return console.error("id不能为空");
        }
        var div = document.createElement('div');
        div.id = id;
        div.style.position = 'absolute';
        FlowLayer.Element.modifyDomStyle(div, style);
        return div;
    },
    /**
     * 修改dom元素的样式相关属性
     * @param dom
     * @param style
     */
    modifyDomStyle: function (dom, style) {
        if (!style) {
            return;
        }
        if (style.height) {
            dom.style.height = style.height;
        }
        if (style.width) {
            dom.style.width = style.width;
        }
        if (style.border) {
            dom.style.border = style.border;
        }
        if (style.transition) {
            dom.style.transition = style.transition;
        }
        if (style.color) {
            dom.style.color = style.color;
        }
        if (style.lineHeight) {
            dom.style.lineHeight = style.lineHeight;
        }
        if (style.borderRadius) {
            dom.style.borderRadius = style.borderRadius;
        }
        if (style.textAlign) {
            dom.style.textAlign = style.textAlign;
        }
        if (style.backgroundColor) {
            dom.style.backgroundColor = style.backgroundColor;
        }
        if (style.zIndex) {
            dom.style.zIndex = style.zIndex;
        }
        if (style.top) {
            dom.style.top = style.top;
        }
        if (style.left) {
            dom.style.left = style.left;
        }
    },
    /**
     * 设置dom元素的绝对位置
     * @param dom 需要设定位置的dom元素
     * @param pos top，left数组,number
     */
    setDomPosition: function (dom, pos) {
        dom.style.top = pos[0] + "px";
        dom.style.left = pos[1] + "px";
    },
    /**
     * 设置dom的内容
     * @param inner 内容，可为文字，html
     */
    setDomContent: function (dom, inner) {
        dom.innerHTML = inner;
    },
    /**
     * 在dom后追加元素，不指定id就在body后追加
     * @param dom
     * @param id
     * @returns
     */
    append: function (dom, id) {
        if (typeof dom == "string") {
            if (!id) {
                return document.body.innerHTML = dom;
            }
            var target = document.getElementById(id);
            if (target) {
                return target.innerHTML = dom;
            }
        } else {
            if (!id) {
                return document.body.appendChild(dom);
            }
            var target = document.getElementById(id);
            if (target) {
                return target.appendChild(dom);
            }
        }
    },
    getDomStyle: function (dom, attr) {
        return dom.style[attr];
    },
    getDomCenter: function (dom, id) {
        var outer_h = '100%', outer_w = '100%', inner_h = 0, inner_w = 0;
        if (!id) {
            outer_h = document.body.offsetHeight;
            outer_w = document.body.offsetWidth;
        } else {
            var outer = document.getElementById(id);
            if (outer) {
                outer_h = FlowLayer.Element.getDomStyle(outer, 'height');
                outer_w = FlowLayer.Element.getDomStyle(outer, 'width');
            } else {
                return console.error("未能找到id为" + id + "的元素")
            }
        }

        if (dom) {
            inner_h = FlowLayer.Element.getDomStyle(dom, 'height');
            inner_w = FlowLayer.Element.getDomStyle(dom, 'width');
        } else {
            return console.error("未提供dom元素")
        }

        return [(parseInt(outer_h) - parseInt(inner_h)) / 2, (parseInt(outer_w) - parseInt(inner_w)) / 2]
    },
};
/**
 * 设置图层的可见性
 * @param visible true/false
 */
FlowLayer.prototype.setVisible = function (visible) {
    this.show(visible);
};
/**
 * 设置图层的可见性
 * @param visible true/false
 */
FlowLayer.prototype.getVisible = function (visible) {
    if (this._container.style.display !== 'none') {
        return true;
    }
    return false;
};

export default FlowLayer;
