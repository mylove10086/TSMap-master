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

class WmsLayer {

  constructor(map, options) {
    this.map = map;
    this.options = extend(this.getDefaultOptions(), options);

    if (hasUndefined(this.map, this.options.url, this.options.layers)) {
      return;
    }

    //用于空间过滤绘制图形
    this.draw = null;
    var src = "EPSG:4326";
    if (options && options.crs) {
      src ='EPSG:'+options.crs
    }
    var projection = new ol.proj.get(src);

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
      projection: projection, // 设置地图的投影为EPSG:26713

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
    } else {
      this.updateParams(null);
      this.attribute = null;
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
        let _this = this;
        this.draw.setDrawEndCallback(function (feature) {
          if (feature) {
            let geometry = feature.getGeometry();

            if (geometry.getType() === 'Polygon') {
              let coordinates = geometry.getCoordinates();

              if (coordinates.length > 0) {
                _this.setCoordinatesParams(coordinates[0]);

                // 返回到外部的空间查询的图形
                if (_this.spatialQueryCallback) {
                  _this.spatialQueryCallback(coordinates[0]);
                }
              }
            }
          }

          _this.draw.removeInteraction();
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
    }
  };

  /**
   * 移除地图
   */
  removeLayer() {
    if (this.layer) {
      this.map.removeLayer(this.layer)
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
}

export default WmsLayer;
