/**
 * 地理编码和逆地理编码
 * @param map 初始化的map
 *
 */
import Draw from "../interaction/Draw";
import PopupsRight from "../overlay/PopupsRight";
import Styles from "../style/Styles";
import markericon from "../../../assets/img/marker-icon.png";
import {isDefined} from "../../../common/util";

class Geocoder {

    constructor(map, options) {
        if (!isDefined(map))
            return;
        if (!T)
            return;
        this.map = map;
        this.draw = null;//用于空间过滤绘制图形
        this.source = new ol.source.Vector();
        this.vector = new ol.layer.Vector({
            source: this.source
        });
        this.defaultStyle = new Styles();

        this.defaultStyle.vectorLayer = this.vector;

        this.defaultStyle.setStyle({
            style: {
                url: markericon,
                anchor: [0.5, 1]
            }
        });
        let label = null;
        this.geocoder = new T.Geocoder();
        this.map.addLayer(this.vector);
        let popups = new PopupsRight(this.map);
        let that = this;
        this.map.on('pointermove', function (e) {

            let pixel = that.map.getEventPixel(e.originalEvent);
            let feature = that.map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });
            if (feature) {
                if (feature.get("geotype") === "point" && label) {
                    let coordinate = e.coordinate;
                    popups.setPosition(coordinate, "", label);
                } else {
                    popups.setPosition(undefined, "", "");
                }
            } else {
                popups.setPosition(undefined, "", "");
            }
        });

        this.searchResult = function (result) {

            var ret = {
                result: result,
                status: result.getStatus(),
                lng: null,
                lat: null,
                type: "Point"
            };
            if (result.getStatus() == 0) {
                var s = result.getLocationPoint();
                var p = new ol.geom.Point([s.lng, s.lat]);

                var pf = new ol.Feature({
                    geometry: p
                });
                pf.set('geotype', "point");
                that.source.addFeature(pf);
                ret["lng"] = s.lng;
                ret["lat"] = s.lat;
                that.center(s.lng, s.lat);
            } else {
                console.log(result.getMsg());
            }
            that.searchCBFun(ret);

        };
        this.locationResult = function (result) {
            var ret = {
                result: result,
                status: result.getStatus(),
                type: "location",
                address: null
            };
            if (result.getStatus() == 0) {
                var addressComponent = result.getAddressComponent();
                that.label = addressComponent.address;
                ret.address = {
                    address: addressComponent.address,//此点最近地点
                    formattedAddress: addressComponent.formatted_address,//此点最近地点
                    distance: addressComponent.address_distance,//最近地点信息距离
                    position: addressComponent.address_position,//此点在最近地点信息方向
                    city: addressComponent.city,//此点所在国家或城市或区县
                    road: addressComponent.road,//距离此点最近的路
                    poi: addressComponent.poi,//距离此点最近poi点
                    roadDistance: addressComponent.road_distance//此点距离此路的距离
                }
            }
            that.searchCBFun(ret);
        };
        /**
         * 绘制结束时代回调函数
         * @param e
         */
        this.deCallback = function (e) {
            if (that.draw && e) {
                var feature = e.getGeometry();
                let coordinate = feature.getCoordinates();
                var t = new T.LngLat(coordinate[0], coordinate[1]);
                that.geocoder.getLocation(t, that.locationResult);
                var p = new ol.geom.Point([coordinate[0], coordinate[1]]);
                var pf = new ol.Feature({
                    geometry: p
                });
                pf.set('geotype', "point");
                that.source.addFeature(pf);
                that.draw.clearFeature();//清空绘制的图形
                that.draw.removeInteraction();
            }
        };
    }

    center(lon, lat) {
        let p = this.map.getView().getProjection();
        let v = this.map.getView();
        if (p.getCode() === 'EPSG:3857') {
            let m_center = [lon, lat];//地图中心点-经纬度坐标
            m_center = ol.proj.transform(m_center, 'EPSG:4326', p.getCode());
            v.setCenter(m_center);
        } else if (p.getCode() === 'EPSG:4326') {
            v.setCenter([lon, lat]);
        }
    }

    /**
     *
     * @param e
     */

    searchCBFun(e) {

    }


    /**
     * 空间查询
     */

    drawPoint() {
        this.label = null;
        this.source.clear();
        let value = "Point";
        if (value) {
            if (!this.draw) {
                this.draw = new Draw(this.map);
                this.draw.setDrawEndCallback(this.deCallback);//设置绘制结束的回调函数
            }
            this.draw.clearFeature();//清空绘制的图形
            this.draw.drawGraphic({type: value});//设置绘制的图形
        } else {
            if (this.draw)
                this.draw.clearFeature();
        }
    };

    /**
     * 清除绘制的图形
     */
    clearDraw() {
        if (this.draw)
            this.draw.clearFeature();
    }

    /**
     * 移除图层
     */

    removeLayer() {
        this.label = null;
        this.source.clear();
        this.map.removeLayer(this.vector);
    }

    /**
     * 添加到地图中
     */
    addLayer() {
        if (this.vector) {
            this.map.removeLayer(this.vector);
            this.map.addLayer(this.vector);
        }
    }

    /**
     * 根据名称获取位置
     * @param object{value:'广州'} 名称
     */

    getPoint(object) {
        this.source.clear();
        this.label = object.value;
        this.geocoder.getPoint(object.value, this.searchResult);
    };

    /**
     * 设置查询结果的返回函数
     * @param fun
     */

    setSearchCallBackFun(fun) {
        this.searchCBFun = fun;
    }

    /**
     * 移除地理编码
     */
    clearGeocoder() {
        this.source.clear();
        this.label = null;
        if (this.draw) {
            this.draw.clearFeature();//清空绘制的图形
            this.draw.removeInteraction();
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
            if (this.vector) {
                if (!this.defaultStyle) {
                    this.defaultStyle = new Styles();
                }
                this.defaultStyle.setStyle(style);
            }
        } else {
            return;
        }

    }

}

export default Geocoder;
