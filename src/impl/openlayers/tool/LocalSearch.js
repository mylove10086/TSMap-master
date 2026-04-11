/**
 * 天地图地名搜索
 * @param map 初始化的map
 *
 */
import PopupsRight from "../overlay/PopupsRight";
import markericon from "../../../assets/img/marker-icon.png";
import Styles from "../style/Styles";

class LocalSearch {

    constructor(map, options) {
        this.map = map;
        this.source = new ol.source.Vector();
        this.vector = new ol.layer.Vector({
            source: this.source,
        });
        this.defaultStyle = new Styles();
        this.defaultStyle.vectorLayer = this.vector;

        this.defaultStyle.setStyle({
            style: {
                url: markericon,
                anchor: [0.5, 1]
            }
        });
        map.addLayer(this.vector);
        let popups = new PopupsRight(map);

        /*this._event = map.on('pointermove', function (e) {
            let pixel = map.getEventPixel(e.originalEvent);
            let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });
            if (feature) {
                if (feature.get("lstype") === "point") {
                    let coordinate = e.coordinate;
                    let label = '<div>名称：' + feature.get('name') + '</div>' +
                        '<div>地址：' + feature.get('address') + '</div>';
                    popups.setPosition(coordinate, "", label);
                } else {
                    popups.setPosition(undefined, "", "");
                }
            } else {
                popups.setPosition(undefined, "", "");
            }
        });*/
        let that = this;
        this.localSearchResult = function (result) {
            //console.log(result);
            //根据返回类型解析搜索结果
            switch (parseInt(result.getResultType())) {
                case 1:
                    //解析点数据结果
                    that.pois(result.getPois());
                    break;
                case 2:
                    //解析推荐城市
                    //statistics(result.getStatistics());
                    break;
                case 3:
                    //解析行政区划边界
                    //area(result.getArea());
                    break;
                case 4:
                    //解析建议词信息
                    //suggests(result.getSuggests());
                    break;
                case 5:
                    //解析公交信息
                    //lineData(result.getLineData());
                    break;
            }
        };
        this.config = {
            pageCapacity: 10,	//每页显示的数量
            onSearchComplete: this.localSearchResult	//接收数据的回调函数
        };
        let div = document.createElement('div');
        let tmap = new T.Map(div);
        tmap.centerAndZoom(new T.LngLat(113, 23), 12);
        //创建搜索对象
        this.localsearch = new T.LocalSearch(tmap, this.config);
    }


    //解析点数据结果
    pois(obj) {
        if (obj) {
            for (let i = 0; i < obj.length; i++) {
                //console.log(obj[i]);
                //名称
                let name = obj[i].name;
                //地址
                let address = obj[i].address;
                //坐标
                let lnglatArr = obj[i].lonlat.split(" ");

                let p = new ol.geom.Point(lnglatArr);
                let pf = new ol.Feature({
                    geometry: p
                });
                pf.set('lstype', "point");
                pf.set('name', name);
                pf.set('address', address);
                pf.set('log', lnglatArr[0]);
                pf.set('lat', lnglatArr[1]);
                this.source.addFeature(pf);
            }

        }
    }

    //解析行政区划边界
    area(obj) {
    }

    /**
     * 设置图层的可见性
     * @param object{visible:true/false}
     */
    setVisible(object) {
        this.vector.setVisible(object.visible);
    };

    /**
     * 移除图层
     */
    removeLayer() {
        this.map.removeLayer(this.vector);
    };

    /**
     * 添加到地图中
     */
    addLayer() {
        if (this.vector) {
            this.map.addLayer(this.vector);
        }
    };

    /**
     * 天地图搜索
     * @param object{value:'广州'}
     */
    search(object) {
        this.source.clear();
        //let cen = new T.LngLat(113.40969, 23.89945);
        //localsearch.searchNearby(value,cen, 100001);
        this.localsearch.search(object.value, 7);
    };

    /**
     * 移除地理编码
     */
    clearGeocoder() {
        this.source.clear();
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
        if (style) {
            if (this.vector) {
                if (!this.defaultStyle) {
                    this.defaultStyle = new Styles();
                }
                this.defaultStyle.vectorLayer = this.vector;
                this.defaultStyle.setStyle(style);
            }
        } else {
            return;
        }

    }

    removeEvent() {
        if (this._event) {
            this.map.un(this._event.type, this._event.listener);
            this._event = null;
        }
    }

}

export default LocalSearch;
