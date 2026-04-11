/**
 * 驾车线路
 * @param map
 * @constructor
 */
import start from "../../../assets/img/start.png";
import end from "../../../assets/img/end.png";
import Draw from "../interaction/Draw";
import {extend, hasUndefined, isDefined} from "../../../common/util";
import Styles from "../style/Styles";

class RouteLayer {
    constructor(map, options) {
        options = options ? options : {};
        this._id = options.id;
        this.map = map;
        this.options = extend({}, options);
        if (hasUndefined(this.map)) {
            return;
        }
        this.draw = null;
        this.pointCoord = [];
        this.totalTime = 0;
        this.totalDistance = 0;
        this.sourceVector = new ol.source.Vector();
        let _this = this;
        this.vectorLayer = new ol.layer.Vector({
            source: this.sourceVector
        });
        this.sstyle = null;
        this.estyle = null;
        this._removefun = null;
        this._clickCallback = null;
        this.routeData = [];//线路查询结果的数据

        //0 最少时间
        //1 最短距离
        //2 避开高速
        //3 步行
        this.policy = 0;//

        this.map.addLayer(this.vectorLayer);

        this.map.on('pointermove', function (e) {
            let pixel = map.getEventPixel(e.originalEvent);
            let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });

            if (feature) {
                if (feature.get("DRType") === "point") {
                    let time = feature.get('time');
                    let distance = feature.get('distance');
                    let innerHTML = '<div>总时长: ' + time + ' 秒</div>' +
                        '<div>总距离: ' + distance + ' 公里</div>';
                    let coordinate = e.coordinate;
                    //popups.setPosition(coordinate, "", innerHTML);
                } else if ('kepPoint' === feature.get("DRType")) {
                    let distance = feature.get('distance');
                    let innerHTML = '<div>' + distance + '</div>';
                    let coordinate = e.coordinate;
                    //popups.setPosition(coordinate, "", innerHTML);
                } else {
                    //this.popups.setPosition(undefined, "", "");
                }
            } else {
                //this.popups.setPosition(undefined, "", "");
            }
        });

        this.routeLayer = new T.DrivingRoute("map", {
            policy: 0,	//驾车策略
            onSearchComplete: function (result) {
                let routes = result.getNumPlans();

                for (let i = 0; i < routes; i++) {
                    //获得单条驾车方案结果对象
                    let plan = result.getPlan(i);

                    //一条线路的描述信息
                    let routeItem = {
                        time: plan.getDuration(),
                        distance: plan.getDistance(),
                        route: null
                    }

                    //显示方案内容
                    _this.totalTime = plan.getDuration();
                    _this.totalDistance = plan.getDistance();

                    //显示该方案每段的描述信息
                    let numRoutes = plan.getNumRoutes();

                    for (let m = 0; m < numRoutes; m++) {
                        let route = plan.getRoute(m);

                        let des = {
                            describe: route.getDescription(),
                            route: route.getPath(),
                            children: []
                        };

                        let numSteps = route.getNumSteps();

                        for (let n = 0; n < numSteps; n++) {
                            let step = route.getStep(n);
                            let lng = step.getPosition().getLng();
                            let lat = step.getPosition().getLat();
                            let info = step.getDescription();
                            let cdes = {
                                describe: info,//描述
                                lng: lng,
                                lat: lat
                            }

                            des.children.push(cdes);

                            let keyPoint = new ol.Feature({
                                name: _this._id,
                                geometry: new ol.geom.Point([lng, lat])
                            });

                            keyPoint.set('distance', info);
                            keyPoint.set('DRType', 'kepPoint');

                            _this.sourceVector.addFeature(keyPoint);
                        }

                        routeItem.route = des;
                    }

                    //显示驾车线路
                    var se = _this.createStartMarker(result);
                    var route = _this.createRoute(plan.getPath());

                    _this.routeData.push({
                        spoint: se[0],
                        epoint: se[1],
                        route: route,
                        routedata: routeItem
                    });
                    if (_this.routeCallback)
                        _this.routeCallback({
                            path: plan.getPath(),
                            routeData: routeItem,
                            result: result
                        });
                }

            }
        });
    }

    //获得驾车路线策略
    getRadioValue() {
        //0 最少时间
        //1 最短距离
        //2 避开高速
        //3 步行
        let obj = [0, 1, 2, 3];

        if (this.policy < 0 || this.policy > 3) {
            this.policy = 0;
        }

        return obj[this.policy];
    }

    //线路查询结束后返回的数据
    setQueryCallback(callback) {
        this.routeCallback = callback;
    }

    //创建线路
    createRoute(path) {
        //console.log(path);
        let arr = [];
        for (let i = 0; i < path.length; i++) {
            arr.push([path[i].lng, path[i].lat])
        }

        let ls = new ol.geom.LineString(arr);

        let feature = new ol.Feature({
            name: this._id,
            geometry: ls,
        });

        this.sourceVector.addFeature(feature);
        return feature;
    }

    //添加起始点
    createStartMarker(result) {
        if (!this.sstyle) {
            this.sstyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.35, 1.0],
                    src: start,
                }),
            });
        }

        if (!this.estyle) {
            this.estyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.35, 1.0],
                    src: end,
                }),
            });
        }


        let endc = result.getEnd();
        let startc = result.getStart();
        let startMarker = new ol.Feature({
            name: this._id,
            geometry: new ol.geom.Point([startc.lng, startc.lat])
        });

        startMarker.set('time', this.totalTime);
        startMarker.set('distance', this.totalDistance);
        startMarker.set('DRType', 'point');
        startMarker.setStyle(this.sstyle);

        let endMarker = new ol.Feature({
            name: this._id,
            geometry: new ol.geom.Point([endc.lng, endc.lat]),
        });

        endMarker.setStyle(this.estyle);
        endMarker.set('time', this.totalTime);
        endMarker.set('distance', this.totalDistance);
        endMarker.set('DRType', 'point');

        this.sourceVector.addFeature(startMarker);
        this.sourceVector.addFeature(endMarker);
        return [startMarker, endMarker];

    }

    searchResult(result) {

    }

    /**
     * 天地图驾车线路查询
     * @param object{
     *               start:[113.33297, 23.99932],//起点坐标
     *               end:[112.36181, 23.86875]//终点坐标
     * }
     */
    searchDrivingRoute(object) {
        //清除上次搜索到路线
        this.sourceVector.clear();

        //起点经纬度
        let startLngLat = new T.LngLat(object.start[0], object.start[1]);

        //终点经纬度
        let endLngLat = new T.LngLat(object.end[0], object.end[1]);

        //设置驾车策略
        this.routeLayer.setPolicy(this.getRadioValue());

        //驾车路线搜索
        this.routeLayer.search(startLngLat, endLngLat);
    };

    /**
     * 绘制起点和终点，绘制完成后自动查询线路
     */
    drawKeyPoint() {
        if (!this.draw) {
            this.draw = new Draw(this.map);
            let _this = this;

            this.draw.setDrawEndCallback(function (e) {
                if (e) {
                    _this.pointCoord.push(e.getGeometry().getCoordinates());

                    if (_this.pointCoord.length === 2) {
                        _this.draw.removeInteraction();//绘制起点和终点后结束绘图
                        _this.searchDrivingRoute({start: _this.pointCoord[0], end: _this.pointCoord[1]});
                        _this.draw.clearFeature();//清空绘制的图形
                    }
                }
            });//设置绘制结束的回调函数

            this.draw.isEndDraw = false;
        }

        this.pointCoord = [];

        this.draw.clearFeature();//清空绘制的图形
        this.draw.drawGraphic('Point');//设置绘制的图形
    };

    /**
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    getFeatureById(id) {
        if (this.sourceVector)
            return this.sourceVector.getFeatureById(id);
        return null
    }

    length() {
        if (this.sourceVector)
            return this.sourceVector.getFeatures().length;
        return 0;
    }

    /**
     * 清空查询的线路
     */
    removeRoute() {
        if (this.draw) {
            this.draw.clear();//清空绘制的图形
            this.draw.removeInteraction();
        }
        this.routeData.length = 0;
        this.sourceVector.clear();
    };
    removeLayer() {
        this.removeClick();
        this.moveClick();
        this.map.removeLayer(this.vectorLayer);
        if (this.vectorSource) {
            this.vectorSource.clear();
            this.vectorSource = null;
        }

        this.vectorLayer = null;
    };
    clear() {
        if (this.draw) {
            this.draw.clearFeature();//清空绘制的图形
            this.draw.removeInteraction();
        }


        this.sourceVector.clear();
    };

    /**
     * 设置图层的可见性
     * @param object {visible:true/false}
     */
    setVisible(object) {
        this.vectorLayer.setVisible(object);
    };

    getVisible() {
        return this.vectorLayer.getVisible();
    };

    setStyle(style) {
        if (style) {
            if (!this.styleSet) {
                this.styleSet = new Styles();
            }
            if (this.vectorLayer) {
                this.styleSet.vectorLayer = this.vectorLayer;
                this.styleSet.setStyle(style);

            }
            if (style.start) {
                this.sstyle = this.styleSet.getStyle(style.start);
                for (var i = 0; i < this.routeData.length; i++) {
                    this.routeData[i].spoint.setStyle(this.sstyle);
                }
            }
            if (style.end) {
                this.estyle = this.styleSet.getStyle(style.end);
                for (var i = 0; i < this.routeData.length; i++) {
                    this.routeData[i].epoint.setStyle(this.estyle);
                }
            }
        } else {
            return;
        }
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
        return this.sourceVector.hasFeature(feature);
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

export default RouteLayer;
