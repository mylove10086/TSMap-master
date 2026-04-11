/**
 * 添加一个wfs图层
 * @param map 初始化的map
 * @param object {
 *                 url:'',//图层url
 *                 layers:''//图层名称
 *                 featureNS:''//图层空间标识符
 *                 featurePrefix:''//图层命名空间
 *                 minZoom:12,//最小的显示比例尺
 *                 this.options.epsg:4326//图层空间坐标系
 *                }
 *
 */
import Styles from "../style/Styles";
import Draw from "../interaction/Draw";
import {extend, hasUndefined, isUndefined} from "../../../common/util";
import {DefaultOptions} from "../../../map/TsMapConstants";
import ClusterLayer from "./ClusterLayer";

class WfsLayer {
    constructor(map, options) {
        options = options ? options : {};
        this._id = options.id;
        this.map = map;
        this.options = extend(this.getDefaultOptions(), options);
        if (hasUndefined(this.map, this.options.url, this.options.layer)) {
            return;
        }
        // 用于空间过滤绘制图形
        this.draw = null;
        this.feature = null;
        this.filters = null;//联合属性和空间查询是用的
        let _this = this;
        this.queryCallBack = null;
        this.querying = false;//查询时返回一次数据
        this.sourceVector = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: function (extent, resolution, projection) {  //加载函数
                let proj = projection.getCode();
                let url = _this.options.url + '&version=1.0.0&request=GetFeature&typename=' + _this.options.featurePrefix + ':' + _this.options.layer
                    + '&outputFormat=application/json&srsname=' + proj + '&' + 'bbox=' + extent.join(',') + ',' + proj;

                if (_this.feature || _this.filters) {
                    let filter = null;

                    if (_this.feature) {
                        let ty = _this.feature.getType();

                        if (ty === "Polygon") {
                            filter = new ol.format.filter.Intersects(_this.options.geom, _this.feature);//相交查询
                        } else {
                            _this.feature = null;
                        }
                    }

                    if (_this.filters) {
                        filter = _this.filters;
                    }

                    if (_this.feature && _this.filters) {
                        filter = ol.format.filter.and(
                            ol.format.filter.intersects(_this.options.geom, _this.feature),
                            _this.filters
                        );
                    }

                    fetch(url, {
                        method: 'POST',
                        body: new XMLSerializer().serializeToString(new ol.format.WFS().writeGetFeature({
                            srsName: 'EPSG:' + _this.options.projection,//坐标系
                            featureNS: _this.options.featureNS,// 注意这个值必须为创建工作区时的命名空间URI
                            featurePrefix: _this.options.featurePrefix,//工作区的命名
                            featureTypes: [_this.options.layer],//所要访问的图层
                            maxFeatures: 5000,
                            outputFormat: 'application/json',
                            //filter: new ol.format.filter.Intersects(geom, this.feature)
                            filter: filter
                        }))
                    }).then(function (response) {
                        return response.json();
                    }).then(function (json) {
                        let features = new ol.format.GeoJSON().readFeatures(json);

                        if (features.length > 0) {
                            if (_this.queryCallBack && _this.querying) {
                                _this.querying = false;
                                var results = [];
                                for (let i = 0; i < json.features.length; i++) {
                                    let item = json.features[i];
                                    results.push({
                                        coordinates: item.geometry.coordinates,
                                        type: item.geometry.type,
                                        properties: item.properties
                                    });
                                }
                                _this.queryCallBack(results);
                            }

                            _this.sourceVector.clear();
                            _this.sourceVector.addFeatures(features);
                        } else {
                            console.log("没有返回要素");
                        }
                    });
                } else {
                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', url);

                    let onError = function () {
                        _this.sourceVector.removeLoadedExtent(extent);
                    };

                    xhr.onerror = onError;
                    xhr.onload = function () {
                        if (xhr.status == 200) {
                            _this.sourceVector.addFeatures(_this.sourceVector.getFormat().readFeatures(xhr.responseText));
                        } else {
                            onError();
                        }
                    };

                    xhr.send();
                }
            },
            strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
                maxZoom: this.options.maxZoom
            })),
            projection: 'EPSG:' + this.options.projection
        });
        this._removefun = null;
        this._clickCallback = null;
        this.vectorLayer = new ol.layer.Vector({
            source: this.sourceVector,
            minZoom: this.options.minZoom,//设置显示比例尺
            maxZoom: this.options.maxZoom //设置显示比例尺
        });
        this.oluid = this.vectorLayer.ol_uid;

        this.map.addLayer(this.vectorLayer);

        this.radius = 100;//半径圆是绘制


    }

    getDefaultOptions() {
        return {
            geom: DefaultOptions.GEOM,
            projection: DefaultOptions.PROJECTION
        };
    }

    clear() {
        this.sourceVector.clear();
        this.sourceVector.refresh();
    }

    /**
     * 用于添加过滤条件
     */
    attributeQuery() {
        this.clear();
    };

    /**
     * 通过坐标进行空间查询的
     * @param object {coordinate:[[经度,纬度]]//长度大于等于3}
     */
    spatialQueryFromPolygon(options) {
        if (options && options.coordinate.length > 3) {
            this.querying = true;
            let geom = new ol.geom.Polygon([options.coordinate]);
            let feature = new ol.Feature(geom);
            this.feature = feature.getGeometry();
            this.clear();
        } else {
            this.feature = null;
            this.clear();
        }
    };

    /**
     * 清除绘制的图形
     */
    clearDraw() {
        if (this.draw) {
            this.draw.clearFeature();
        }
    };

    /**
     * 设置绘制完成的回调函数
     * @param callback
     */
    setSpatialQueryCallback(callback) {
        this.queryCallBack = callback;
    };

    /**
     * 空间查询
     * @param object {type:'Circle'//'Circle' 'Polygon' 'Box'}
     */
    spatialQuery(type) {
        if (type) {
            if (isUndefined(this.draw)) {
                this.draw = new Draw(this.map);

                let _this = this;

                this.draw.setDrawEndCallback(function (feature) {
                    if (feature) {
                        let geometry = feature.getGeometry();
                        _this.feature = feature.getGeometry();

                        if (geometry.getType() === 'Polygon') {
                            let coordinates = geometry.getCoordinates();

                            if (coordinates.length > 0) {
                                // 返回到外部的空间查询的图形

                            }
                        }

                        _this.clear();
                    }

                    _this.draw.removeInteraction();
                });//设置绘制结束的回调函数
            }

            if (this.radius) {
                this.draw.radius = this.radius;//设置半径
            } else {
                this.draw.radius = 100;//设置半径
            }

            //console.log(type)

            this.draw.clearFeature();//清空绘制的图形
            this.draw.drawGraphic(type);//设置绘制的图形
        } else {
            if (this.draw) {
                this.draw.clearFeature();
            }
            this.feature = null;
            this.clear();
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

    getFeatureById(id) {
        return this.sourceVector.getFeatureById(id);
    }

    length() {
        return this.sourceVector.getFeatures().length;
    }

    /**
     * 修改图层几何字段名称，默认是‘geom’
     * @param geom 字符串，从数据库或者geoserver中查看几何字段
     */
    setGeom(geom) {
        this.options.geom = geom;
    };

    /**
     * 移除图层
     */
    removeLayer() {
        this.removeClick();
        this.moveClick();

        if (this.sourceVector) {
            this.sourceVector.clear();
            this.sourceVector = null;
        }
        this.map.removeLayer(this.vectorLayer);
    };

    /**
     * 重新添加地图
     */
    addLayer() {
        if (this.vectorLayer) {
            this.map.addLayer(this.vectorLayer);
        }
    };

    /**
     * 更新图形，用于更新半径圆，重新设置半径后更新已经绘制的半径圆
     */
    updateRadius() {
        if (this.draw) {
            if (this.radius) {
                this.draw.radius = this.radius;//设置半径
            } else {
                this.draw.radius = 100;//设置半径
            }
            this.draw.updateFeature();
        }

    };

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
        this.styleSet.vectorLayer = this.vectorLayer;
        this.styleSet.setStyle(style);
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
    /**
     *  设置聚合图层的样式
     * @param options
     */
    setClusterStyle(options) {
        /*if (this.clusterLayer) {
            this.clusterLayer.setStyle(options);
        }*/
    }

    cluster(bol) {
       /* if (!this.clusterLayer && bol) {
            this.clusterLayer = new ClusterLayer(this.map, {source: this.vectorSource});
            /!*const features = this.vectorSource.getFeatures();
            for (let i = 0; i < features.length; i++) {
                let item = features[i];
                let type = item.getGeometry().getType();
                if (type === "Point") {
                    let p = item.getGeometry().getCoordinates();
                    var gid = item.get("gid");
                    let graphic = {
                        "geometry": {
                            "type": "Point",
                            "coordinates": p
                        }, properties: {
                            gid: gid
                        }
                    };
                    this.clusterLayer.addFeature(graphic);
                }
            }*!/
            this.vectorLayer.setVisible(false);
        } else {
            if (this.clusterLayer) {
                this.clusterLayer.removeLayer();
            }
            this.clusterLayer = null;
            this.vectorLayer.setVisible(true);
        }*/
    }

}

export default WfsLayer;


