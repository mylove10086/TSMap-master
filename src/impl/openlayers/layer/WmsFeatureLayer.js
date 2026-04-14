/**
 * 添加一个wms图层
 * @param map 初始化的map
 * @param object {
 *                 url:'',//图层url
 *                 layers:''//图层名称
 *                }
 *
 */
import Draw from "../interaction/Draw";
import {isDefined, hasUndefined, extend, isUndefined} from "../../../common/util";
import {DefaultOptions, MapEngineType} from "../../../map/TsMapConstants";
import Styles from "../style/Styles";
import insidePolygon from "../common/InsidePolygon";
import SourceVector from "../common/SourceVector";

class WmsFeatureLayer {

    constructor(map, options, olmap) {
        this.map = map;
        this.olmap = olmap;
        this.options = extend(this.getDefaultOptions(), options);
        this._maxLevel = options.maxlevel ? parseInt(options.maxlevel) : 13;

        this._show = true;
        //用于空间过滤绘制图形
        this.draw = null;
        this.geom = this.options.geom ? this.options.geom : "geom";
        let ln = this.options.layer.split(":");
        this.layerName = ln.length > 1 ? ln[1] : ln[0];

        /* this.wmsSource = new ol.source.TileWMS({
             url: this.options.url,
             // 参数属性名的大小有影响
             params: {
                 'FORMAT': 'image/png',
                 'VERSION': '1.1.1',
                 'TILED': false,
                 "LAYERS": this.options.layer,
                 "exceptions": 'application/vnd.ogc.se_inimage'
             },
             serverType: 'geoserver',
             crossOrigin: 'anonymous',
         });*/
        this.wmsSource = new ol.source.TileWMS({
            url: this.options.url,
            // 参数属性名的大小有影响
            params: {
                'FORMAT': 'image/png',
                'VERSION': '1.1.1',
                'TILED': false,
                "LAYERS": this.options.layer,
                "exceptions": 'application/vnd.ogc.se_inimage'
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
        });

        this.layer = new ol.layer.Tile({
            source: this.wmsSource
        });


        this.map.addLayer(this.layer);

        this.radius = 100;//半径圆是绘制

        this.attribute = null;//联合属性和空间查询是用的
        this.spatial = null;//联合属性和空间查询是用的
        var fl = this.options.layer.split(":");
        let that = this;
        this.cql = options.cql;
        this.feature = null;// 空间查询的多边形

        this.sourceVector = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: function (extent, resolution, projection) {  //加载函数
                let proj = projection.getCode();

                if (that.cql || that.feature) {
                    var CQL_FILTER = "CQL_FILTER=" + that.cql + " and BBOX(geom," + extent.join(',') + ")";
                    let url = options.url + '/ows?service=WFS&version=1.0.0&request=GetFeature&typename=' + options.layer
                        + '&outputFormat=application/json&srsname=' + proj + '&' + CQL_FILTER;
                    let filter = null;
                    if (that.feature) {
                        let ty = that.feature.getType();
                        if (ty === "Polygon") {
                            filter = new ol.format.filter.Intersects(that.geom, that.feature);//相交查询
                        } else {
                            that.feature = null;
                        }
                    }

                    fetch(url, {
                        method: 'POST',

                    }).then(function (response) {
                        return response.json();
                    }).then(function (json) {
                        let features = new ol.format.GeoJSON().readFeatures(json);

                        if (features.length > 0) {
                            if (that.queryCallBack && that.querying) {
                                that.querying = false;
                                var results = [];
                                for (let i = 0; i < json.features.length; i++) {
                                    let item = json.features[i];
                                    results.push({
                                        coordinates: item.geometry.coordinates,
                                        type: item.geometry.type,
                                        properties: item.properties
                                    });
                                }
                                that.queryCallBack(results);
                            }
                            for (var i = 0; i < features.length; i++) {
                                features[i]._layer = that;
                            }
                            //that.sourceVector.clear();
                            that.sourceVector.addFeatures(features);
                        } else {
                            console.log("没有返回要素");
                        }
                    });
                } else {
                    let url = options.url + '/ows?service=WFS&version=1.0.0&request=GetFeature&typename=' + options.layer
                        + '&outputFormat=application/json&srsname=' + proj + '&' + 'bbox=' + extent.join(',');

                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', url);
                    let onError = function () {
                        that.sourceVector.removeLoadedExtent(extent);
                    };

                    xhr.onerror = onError;
                    xhr.onload = function () {
                        if (xhr.status == 200) {
                            var graphics = that.sourceVector.getFormat().readFeatures(xhr.responseText);
                            for (var i = 0; i < graphics.length; i++) {
                                graphics[i]._layer = that;
                            }
                            that.sourceVector.addFeatures(graphics);
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
            visible: false,
            minZoom: this._maxLevel,//设置显示比例尺
            //maxZoom: this.options.maxZoom //设置显示比例尺
        });
        this.oluid = this.vectorLayer.ol_uid;

        this.map.addLayer(this.vectorLayer);
        if (options.cql) {
            this.attributeQuery(options)
        }

        var listVisitor = false;
        var _zoom = 0;
        //点击返回要素
        this._clickCallback = function (e, f, obj) {
            let url = that.getFeatureInfoUrl({lon: obj.coordinate[0], lat: obj.coordinate[1]});

            fetch(url, {
                method: 'get',
            }).then(function (response) {
                return response.json();
            }).then(function (json) {
                if (that._callback) {
                    if (json.features && json.features.length > 0) {
                        obj.features=[];
                        let le = json.features.length;
                        for (var i = 0; i < le; i++) {
                            var item = json.features[i];
                            let p = new ol.geom.Point(item.geometry.coordinates);
                            var g = new ol.Feature({
                                geometry: p
                            });
                            let attr = null;
                            if (item && item.properties) {
                                attr = item.properties;
                            }
                            for (var int in attr) {
                                g.set(int, attr[int]);
                            }
                            obj.features.push({
                                zoom: _zoom,
                                feature: g,
                                properties: item.properties
                            });
                        }

                        that._callback(that, obj.features[0], obj);

                    } else {
                        that._callback(that, obj.features[0], obj);
                    }
                }
            });
        }
        this._callback = null;

        this.moveendeventfun = function (scope, zoom) {
            _zoom = zoom;
            if (that._show) {
                if (zoom > that._maxLevel) {
                    listVisitor = true;
                    that.layer.setVisible(false);
                    that.vectorLayer.setVisible(true);
                } else {
                    listVisitor = false;

                    that.layer.setVisible(true);
                    that.vectorLayer.setVisible(false);
                }
            }
        }

        this._moveendfun = this.olmap._moveendevent.addEventListener(this.moveendeventfun, this);
    }

    getDefaultOptions() {
        return {
            geom: DefaultOptions.GEOM,
            projection: DefaultOptions.PROJECTION
        };
    }

    /**
     * 用于空间查询的坐标数组
     * @param coord
     */
    setCoordinatesParams(coord) {
        if (coord && coord.length >= 3) {
            let str = '';

            for (let t = 0; t < coord.length; t++) {
                let item = coord[t];
                if (t === 0) {
                    str += item.join(' ');
                } else {
                    str += ',' + item.join(' ');
                }
            }
            this.spatial = "INTERSECTS(" + this.options.geom + ", POLYGON((" + str + ")))";
            this.updateParams(this.spatial);
        } else {
            this.updateParams();
        }
    }

    /**
     * 更新参数
     * @param param
     */
    updateParams(param) {
        //let str = 'type_id BETWEEN 1000 AND 3000'
        //let str = "address IN ('东莞市大岭山镇大塘朗村湖畔工业园', '东莞市厚街镇桥头村黑山工业区', '东莞市厚街镇新围社区环湖路旁', '东莞市厚街镇双岗管理区官美厦村')"
        //let str = "type_id >1000 and address like '东莞市%'"
        if (param) {
            /*let ps = param;
            if (attribute) {
                ps = ps + " and " + attribute;
            }*/
            this.wmsSource.updateParams({
                CQL_FILTER: param
            });
        } else
            this.wmsSource.updateParams({
                CQL_FILTER: null
            });
    }

    /**
     * 用于添加过滤条件
     * @param object {condition:'type_id BETWEEN 1000 AND 3000'}
     * condition 当等于null是清除过滤条件，下面是过滤的例子
     *  let condition='type_id BETWEEN 1000 AND 3000'
     *  let condition="address IN ('东莞市大岭山镇大塘朗村湖畔工业园', '东莞市厚街镇桥头村黑山工业区', '东莞市厚街镇新围社区环湖路旁', '东莞市厚街镇双岗管理区官美厦村')"
     *  let condition="type_id >1000 and address like '东莞市%'"
     *  let condition="address like '东莞市%'"
     *  let condition="address = '东莞市大岭山镇大塘朗村湖畔工业园'"
     */
    attributeQuery(object) {
        if (object && object.cql) {
            this.updateParams(object.cql);
            this.attribute = object.cql;
            this.cql = object.cql;
            this.clear();
        } else {
            this.updateParams(null);
            this.attribute = null;
            this.cql = null;
            this.clear();
        }

    };


    /**
     * 空间查询
     * @param type //'Circle' 'Polygon' 'Box'
     */
    spatialQuery(type) {
        if (type) {
            if (isUndefined(this.draw)) {
                this.draw = new Draw(this.map);
                let that = this;
                this.draw.setDrawEndCallback(function (feature) {
                    if (feature) {
                        let geometry = feature.getGeometry();

                        if (geometry.getType() === 'Polygon') {
                            that.feature = geometry;
                            let coordinates = geometry.getCoordinates();

                            if (coordinates.length > 0) {
                                that.setCoordinatesParams(coordinates[0]);

                                // 返回到外部的空间查询的图形
                                if (that.spatialQueryCallback) {
                                    that.spatialQueryCallback(coordinates[0]);
                                }
                            }
                        }
                    }

                    that.draw.removeInteraction();
                });//设置绘制结束的回调函数
            }
            this.draw.equally = 72;
            if (this.radius) {
                this.draw.radius = this.radius;//设置半径
            } else {
                this.draw.radius = 100;//设置半径
            }
            this.draw.clearFeature();//清空绘制的图形
            this.draw.drawGraphic(type);//设置绘制的图形
        } else {
            if (this.draw) {
                this.draw.clearFeature();
            }

            this.updateParams();
            this.spatial = null;
        }
    };

    /**
     * 通过坐标进行空间查询的
     * @param object {coordinate:[[经度,纬度],[经度,纬度],[经度,纬度]]}，长度大于等于3
     */
    spatialQueryFromPolygon(object) {
        if (object) {
            this.setCoordinatesParams(object.coordinate);
        } else {
            this.updateParams();
        }
    };

    /**
     * 空间过滤的回调函数设置，用于在多个wms图层在同一个空间过滤时使用，
     * 在样只需要在一个图层绘图就能获取的空间过滤的图形，回调函数会返回一个坐标数组
     * @param callback
     */
    setSpatialQueryCallback(callback) {
        this.spatialQueryCallback = callback;
    };

    clearSpatialQueryCallback() {
        this.spatialQueryCallback = undefined;
    };

    spatialQueryFromPolygon(object) {
        /*let ret = [];
        if (object && object.coordinate.length > 3) {
            if (this.featureCollection.length === 0) {
                this.featureCollection = this.sourceVector.getFeatures();
            }
            this.clear();
            let collect = [];
            for (let i = 0; i < this.featureCollection.length; i++) {
                let item = this.featureCollection[i];
                let p = item.getGeometry().getCoordinates();
                let bol = insidePolygon(object.coordinate, p);
                if (bol) {
                    collect.push(item);
                    let geo = {
                        geometry: {
                            "type": "Point",
                            "coordinates": p
                        },
                        properties: item.values_
                    };
                    ret.push(geo);
                }
            }
            this.sourceVector.addFeatures(collect);
        } else {
            if (this.featureCollection.length > 0) {
                this.clear();
                this.sourceVector.addFeatures(this.featureCollection);

            }
        }
        return ret*/
    }

    /**
     * 清除绘制的图形
     */
    clearDraw() {
        if (this.draw) {
            this.draw.clearFeature();
        }
    };

    /**
     * 重新添加地图
     */
    addLayer() {
        if (this.layer) {
            this.map.addLayer(this.layer);
            this.map.addLayer(this.vectorLayer);
            if (!this._moveendfun) {
                this._moveendfun = this.olmap._moveendevent.addEventListener(this.moveendeventfun, this);
            }
        }
    };

    /**
     * 移除地图
     */
    removeLayer() {
        this.removeClick();

        if (this.sourceVector) {
            this.sourceVector.clear();
            this.sourceVector = null;
        }

        if (this.layer) {
            this.map.removeLayer(this.layer)
            this.map.removeLayer(this.vectorLayer)
        }
        if (this._moveendfun) {
            this._moveendfun();
            this._moveendfun = null;
        }
    };

    /**
     * 获取图层的可见性
     * @returns {true/false}
     */
    getVisible() {
        return this.layer.getVisible();
    };

    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    setVisible(visible) {
        this.layer.setVisible(visible);
        this._show = visible;
    };

    /**
     * 修改图层几何字段名称，默认是‘geom’
     * @param geom 从数据库或者geoserver中查看几何字段
     */
    setGeom(geom) {
        this.options.geom = geom;
    };

    /**
     * 通过一个点坐标获取查询的url
     * @param object {lon:112, lat:23// 纬度   }
     */
    getFeatureInfoUrl(object) {
        let viewResolution = this.map.getView().getResolution();
        let param = [object.lon, object.lat];
        let url = this.wmsSource.getFeatureInfoUrl(param, viewResolution, this.map.getView().getProjection(), {
            'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50
        });
        return url;
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
            this._removefun = this.olmap._wmsevent.addEventListener(this._clickCallback, this);
            this._removefun = this.olmap._event.addEventListener(fun, this);
            this._callback = fun;
        }
    }

    contains(feature) {
        return this.sourceVector.hasFeature(feature);
    }

    /**
     * 更新图形，用于更新半径圆，重新设置半径后更新已经绘制的半径圆
     */
    updateRadius() {
        if (this.radius) {
            this.draw.radius = this.radius;//设置半径
        } else {
            this.draw.radius = 100;//设置半径
        }

        this.draw.updateFeature();
    };

    setZIndex(index) {
        var z = this.layer.getZIndex();
        switch (index) {
            case 0:
                this.layer.setZIndex(0);
                break;
            case 2:
                z = this.map.getLayers().getLength();
                this.layer.setZIndex(z - 1);
                break;
            case -1:
                z = z - 1;
                if (z <= 0) {
                    z = 0;
                }
                this.layer.setZIndex(z);
                break;
            default:
                this.layer.setZIndex(z + 1);
                break;

        }
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

        if (style) {
            if (this.vectorLayer) {
                if (!this.styleSet) {
                    this.styleSet = new Styles();
                }
                this.styleSet.vectorLayer = this.vectorLayer;
                this.styleSet.setStyle(style);
                this._style = style;

            }
            if (style.distance && this.vectorLayer) {
                this.vectorLayer._distance = style.distance;
            }
        } else {
            if (this.vectorLayer) {
                this.vectorLayer._distance = null;
            }
        }
    }

    clear() {
        this.sourceVector.clear();
        this.sourceVector.refresh();
    }

    getFeatureById(id) {
        var ids = id ? id : "";
        let feature = this.sourceVector.getFeatureById(ids);
        return feature;
    }

    /**
     * 高亮要素
     */
    addHighFeature(feature) {
        if (typeof feature === 'string') {
            var index = feature.indexOf(".");
            var key = feature;
            if (index < 0) {
                key = this.layerName + "." + feature;
            }
            return this.sourceVector.getFeatureById(key);
        } else {


            var graphics = SourceVector.createFeature(feature);
            var id = graphics.getId();
            var index = id.indexOf(".");
            var key = id;
            if (index < 0) {
                key = this.layerName + "." + id;//id添加图层名
            }
            var gg = this.getFeatureById(key);
            if (gg) {
                return gg;
            }
            graphics.setId(key);
            this.sourceVector.addFeature(graphics);
            graphics._layer = this;
            return graphics;
        }
    }

}

export default WmsFeatureLayer;
