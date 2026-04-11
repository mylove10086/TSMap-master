/**
 * 添加一个wfs图层
 * @param map 初始化的map
 * @param object {
 *                 url:'',//图层url
 *                 layers:''//图层名称
 *                 featureNS:''//图层空间标识符
 *                 featurePrefix:''//图层命名空间
 *                }
 */
import {extend, isUndefined} from "../../../common/util";
import {isDefined, hasUndefined} from "../../../common/util";
import {DefaultOptions} from "../../../map/TsMapConstants";
import Draw from "../interaction/Draw";

class HeatMapLayer {

    constructor(map, options) {
        this.map = map;
        this.options = extend(this.getDefaultOptions(), options);

        if (hasUndefined(this.map)) {
            return;
        }
        this.radius = 100;

        this.draw = null;//用于空间过滤绘制图形
        if (this.options.coordinate) {
            let geom = new ol.geom.Polygon([this.options.coordinate]);
            let feature = new ol.Feature(geom);
            this.feature = feature.getGeometry();
        } else {
            this.feature = null;
        }
        this.filters = null;
        let _this = this;
        this.queryCallBack = null;

        if (isDefined(this.options.url)) {
            this.sourceVector = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                loader: function (extent, resolution, projection) {
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
                                if (_this.queryCallBack) {
                                    _this.queryCallBack(json);
                                }
                                //console.log(features.length)
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
                        }
                        xhr.onerror = onError;
                        xhr.onload = function () {
                            if (xhr.status == 200) {
                                _this.sourceVector.addFeatures(_this.sourceVector.getFormat().readFeatures(xhr.responseText));
                            } else {
                                onError();
                            }
                        }
                        xhr.send();
                    }
                    /*
                       let xhr = new XMLHttpRequest();
                       xhr.open('GET', url);
                       let onError = function () {
                           _this.sourceVector.removeLoadedExtent(extent);
                       }
                       xhr.onerror = onError;
                       xhr.onload = function () {
                           if (xhr.status == 200) {
                               _this.sourceVector.addFeatures(_this.sourceVector.getFormat().readFeatures(xhr.responseText));
                           } else {
                               onError();
                           }
                       }
                       xhr.send();*/
                },
                strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
                    maxZoom: this.options.maxZoom
                })),
                projection: 'EPSG:' + this.options.projection
            });
        } else {
            this.sourceVector = new ol.source.Vector({wrapX: false});
        }

        let _blur = 10;
        let _radius = 10;
        this.weight = "weight";

         this.vectorLayer = new ol.layer.Heatmap({
            source: this.sourceVector,
            blur: parseInt(_blur, 10),
            radius: parseInt(_radius, 10),
            weight: function (feature) {
                let magnitude = 1;
                if (_this.weight) {
                    let value = feature.get(_this.weight);
                    if (isDefined(value)) {
                        magnitude = parseFloat(value, 1);
                    }
                }
                if (magnitude > 1) {
                    magnitude = 1;
                }
                if (magnitude < 0) {
                    magnitude = 0
                }
                return magnitude;
            },
        });

        this.map.addLayer( this.vectorLayer);
    }

    getDefaultOptions() {
        return {
            geom: DefaultOptions.GEOM,
            projection: DefaultOptions.PROJECTION
        };
    }

    /**
     * 通过坐标进行空间查询的
     * @param object {coordinate:[[经度,纬度]]//长度大于等于3}
     */
    spatialQueryFromPolygon(object) {
        if (object.coordinate.length > 3) {
            this.clear();
            let geom = new ol.geom.Polygon([object.coordinate]);
            let feature = new ol.Feature(geom);
            this.feature = feature.getGeometry();
            //this.clear();
        }
    };

    spatialQuery(object) {

        this.feature = null;
        this.filters = null;
        this.sourceVector.clear();
        this.sourceVector.refresh();

    };

    /**
     * 设置图层的可见性
     * @param bol true/false
     */
    setVisible(visible) {
         this.vectorLayer.setVisible(visible);
    };
    getVisible() {
        return  this.vectorLayer.getVisible();
    };

    clear() {
        this.sourceVector.clear();
    }


    /**
     * 设置模糊度
     * @param options {value:10}
     */
    setBlur(options) {
         this.vectorLayer.setBlur(parseInt(options.value, 10));
    };

    /**
     * 设置半径
     * @param options {value:10}
     */
    setRadius(options) {
         this.vectorLayer.setRadius(parseInt(options.value, 10));
    };

    /**
     * 添加点坐标
     * @param objects{data:[{
                coordinate: [x + num1, y + num2],
                weight: weight
            }]}
     */
    addPints(objects) {
        this.sourceVector.clear();

        for (let i = 0; i < objects.data.length; i++) {
            let item = objects.data[i];
            let point = new ol.geom.Point(item.coordinate);

            let endMarker = new ol.Feature({
                geometry: point,
            });

            let value = {weight: item.weight};

            endMarker.setProperties(value);

            this.sourceVector.addFeature(endMarker);
        }
    }

    setClickCallback(fun) {

    } setMoveCallback(fun) {

    }

    contains(feature) {
        return false;
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

export default HeatMapLayer;
