/**
 * 创建一个绘图对象
 * @param map 初始化的map
 * @returns {*} draw
 * @constructor
 */
import VectorLayer from "../layer/VectorLayer"
import {extend, hasUndefined, isUndefined} from "../../../common/util"
import {DefaultOptions, GraphicType} from "../../../map/TsMapConstants";
import Styles from "../style/Styles";
import Algorithm from "../common/algorithnm/Algorithm";
import Translate from "./Translate";

class Draw {
  constructor(map, options) {
    options = options ? options : {};
    this._id = options.id;
    this.map = map;
    this.options = extend({}, options);
    if (hasUndefined(this.map)) {
      return;
    }
    this.styleFun = null;
    this.drawStyle = null;//绘图时的样式
    this.draw = null;
    this.vectorLayer = new VectorLayer(this.map, this.options);
    // 绘制完一次后是否结束绘图
    this.isEndDraw = true;
    // 半径，绘制指定半径圆用
    this.radius = 100;
    this.equally = 90;
    this.radiusCircleCoordinate = null;//圆的中心坐标
    this.radiusFeature = null;

    this.translate = new Translate(map, this.vectorLayer.vectorLayer, this.vectorLayer.sourceVector);
    let that = this;
    this.controlPoint = [];

    this.defaultStyle = new Styles();
    this.style = null;
    this.drawType = null;
    this.createFineArrow = function (coordinates, opt_geometry, projection) {
      var geometry = opt_geometry;
      if (geometry) {
        var s = coordinates[0];
        var e = coordinates[1];
        that.controlPoint[0] = s;
        that.controlPoint[1] = e;
        var positions = Algorithm.fineArrow(s, e);
        //positions.push(e);
        geometry.setCoordinates([
          positions,
        ]);
      } else {
        geometry = new ol.geom.Polygon(coordinates);
      }
      //console.log(coordinates);
      return geometry;
    }
    this.createAttackArrow = function (coordinates, opt_geometry, projection) {
      var geometry = opt_geometry;
      if (geometry) {
        if (coordinates && coordinates[0].length >= 3) {
          that.controlPoint = coordinates[0];
          var positions = Algorithm.tailedAttackArrow(coordinates[0]);
          geometry.setCoordinates([
            positions.polygonalPoint
          ]);
        } else {
          //positions.push(e);
          geometry.setCoordinates([
            coordinates,
          ]);
        }
      } else {
        geometry = new ol.geom.Polygon(coordinates);
      }
      return geometry;
    }
    this.createPincerArrow = function (coordinates, opt_geometry, projection) {
      var geometry = opt_geometry;
      if (geometry) {
        if (coordinates && coordinates[0].length >= 3) {
          that.controlPoint = coordinates[0];
          var positions = Algorithm.doubleArrow(coordinates[0]);
          geometry.setCoordinates([
            positions.polygonalPoint
          ]);
        } else {
          //positions.push(e);
          geometry.setCoordinates([
            coordinates,
          ]);
        }


      } else {
        geometry = new ol.geom.Polygon(coordinates);
      }
      //console.log(coordinates);
      return geometry;
    }
    this.createPolygon = function (coordinates, opt_geometry, projection) {
      var geometry = opt_geometry;
      if (geometry) {
        if (coordinates && coordinates[0].length >= 3) {
          that.controlPoint = coordinates;
          switch (that.drawType) {
            case GraphicType.EllipseGeom:
              var positions = Algorithm.getEllipseGeom(coordinates[0]);
              geometry.setCoordinates([
                positions
              ]);
              break
          }

        } else {
          //positions.push(e);
          geometry.setCoordinates([coordinates]);
        }


      } else {
        geometry = new ol.geom.Polygon(coordinates);
      }
      //console.log(coordinates);
      return geometry;
    }
    this.createLine = function (coordinates, opt_geometry, projection) {
      var geometry = opt_geometry;
      if (geometry) {
        if (coordinates && coordinates.length >= 3) {
          that.controlPoint = coordinates;
          switch (that.drawType) {
            case GraphicType.CurveAlgorithm:
              var positions = Algorithm.getCurveAlgorithm(coordinates);
              geometry.setCoordinates(positions);
              break
          }


        } else {
          //positions.push(e);
          geometry.setCoordinates(coordinates);
        }


      } else {
        geometry = new ol.geom.LineString(coordinates);
      }
      //console.log(coordinates);
      return geometry;
    }
  }

  /**
   * 停止绘图
   */
  removeInteraction() {
    this.map.removeInteraction(this.draw);
    this.draw = null;
  }

  /**
   * 设置绘制结束的回调函数
   * @param callback
   */
  setDrawEndCallback(callback) {
    this.drawEndCallback = callback;
    this.translate.setCallback(callback);
  };

  drawRadiusCircleFun(coordinates) {
    //画半径圆
    if (coordinates) {
      this.radiusCircleCoordinate = coordinates;
      let circleIn3857 = new ol.geom.Circle(ol.proj.transform(coordinates, this.map.getView().getProjection(), 'EPSG:3857'), this.radius, 'XY');
      let circleIn4326 = circleIn3857.transform('EPSG:3857', this.map.getView().getProjection());
      let circle4326 = new ol.geom.Polygon.fromCircle(circleIn4326, this.equally, 0);
      let feature = new ol.Feature(circle4326);
      this.radiusFeature = feature;
      feature.set("name", this._id);
      this.vectorLayer.getSourceVector().addFeature(feature);
      let obj = {
        coordinate: feature.getGeometry().getCoordinates()[0],
        type: feature.getGeometry().getType(),
        controlPoint: feature.get('controlPoint'),
        action: 'add',
        gid: feature.getId()
      };
      if (this.drawEndCallback)
        this.drawEndCallback(feature, obj);
    }
  }

  /**
   * 设置绘制的图形并启用绘图
   *
   * @param type Point、Polygon、Circle、LineString、Square、Box
   */
  drawGraphic(type) {
    if (isUndefined(type)) {
      return;
    }
    this.translate.removeSelectInteraction();

    this.removeInteraction();

    let geometryFunction = null;
    let targetType = null;
    let _this = this;
    this.controlPoint = [];
    switch (type) {
      case GraphicType.CIRCLE:
        var circleFun = new ol.interaction.Draw.createRegularPolygon(DefaultOptions.CIRCLE_POINT_COUNT);
        geometryFunction = function (coordinates, opt_geometry, projection) {
          _this.controlPoint = coordinates;
          let geometry = circleFun(coordinates, opt_geometry, projection);
          return geometry;
        };
        targetType = GraphicType.CIRCLE;
        break;
      case GraphicType.RADIUS_CIRCLE:
        targetType = GraphicType.POINT;
        break;
      case GraphicType.POINT:
        targetType = GraphicType.POINT;
        break;
      case GraphicType.LINE_STRING:
        targetType = GraphicType.LINE_STRING;
        break;
      case GraphicType.POLYGON:
        targetType = GraphicType.POLYGON;
        break;
      case GraphicType.BOX:
        targetType = GraphicType.CIRCLE;
        var circleFun = new ol.interaction.Draw.createBox();
        geometryFunction = function (coordinates, opt_geometry, projection) {
          _this.controlPoint = coordinates;
          let geometry = circleFun(coordinates, opt_geometry, projection);
          return geometry;
        };
        break;
      case GraphicType.SQUARE:
        targetType = GraphicType.CIRCLE;
        var circleFun = new ol.interaction.Draw.createRegularPolygon(4);
        geometryFunction = function (coordinates, opt_geometry, projection) {
          _this.controlPoint = coordinates;
          let geometry = circleFun(coordinates, opt_geometry, projection);
          return geometry;
        };
        break;
      case GraphicType.FINEARROW:
        targetType = GraphicType.CIRCLE;
        geometryFunction = this.createFineArrow;
        break;
      case GraphicType.ATTACKARROW:
        targetType = GraphicType.POLYGON;
        geometryFunction = this.createAttackArrow;
        break;
      case GraphicType.PINCERARROW:
        targetType = GraphicType.POLYGON;
        geometryFunction = this.createPincerArrow;
        break;
      case GraphicType.CurveAlgorithm:
        targetType = GraphicType.LINE_STRING;
        this.drawType = GraphicType.CurveAlgorithm;
        geometryFunction = this.createLine;
        break;
      case GraphicType.EllipseGeom:
        targetType = GraphicType.CIRCLE;
        geometryFunction = function (coordinates, opt_geometry, projection) {
          _this.controlPoint = coordinates;
            let geometry = Algorithm.getEllipseGeom(coordinates, opt_geometry, projection);
          return geometry;
        };
        break;
      default:
        targetType = GraphicType.POINT;
        break;
    }
    this.draw = new ol.interaction.Draw({
      stopClick: true,
      type: targetType,
      geometryFunction: geometryFunction,
      style: this.drawStyle
    });

    this.draw.on('drawend', function (e) {
      e.feature.setId(createGuid());
      if (GraphicType.RADIUS_CIRCLE === type) {
        //画半径圆
        let coordinate = e.feature.getGeometry().getCoordinates();
        _this.drawRadiusCircleFun(coordinate);
      } else {
        let coordinate = e.feature.getGeometry().getCoordinates();

        switch (type) {
          case GraphicType.POINT:
          case GraphicType.LINE_STRING:
            _this.controlPoint = coordinate;
            break;
          case GraphicType.POLYGON:
            coordinate = coordinate[0];
            _this.controlPoint = coordinate;
            break;
          case GraphicType.BOX:
          case GraphicType.CIRCLE:
          case GraphicType.SQUARE:
          case GraphicType.FINEARROW:
          case GraphicType.ATTACKARROW:
          case GraphicType.PINCERARROW:
          case GraphicType.EllipseGeom:
            coordinate = coordinate[0];
            break;
        }
        e.feature.set("controlPoint", _this.controlPoint);
        e.feature.set("graphicType", type);
        e.feature.set("name", _this._id);

        if (_this.style)
          e.feature.setStyle(_this.style);
        _this.vectorLayer.getSourceVector().addFeature(e.feature);
        let obj = {
          coordinate: coordinate,
          type: e.feature.getGeometry().getType(),
          action: 'add',
          controlPoint: e.feature.get('controlPoint'),
          gid: e.feature.getId()
        };
        if (_this.drawEndCallback)
          _this.drawEndCallback(e.feature, obj);
      }

      if (_this.isEndDraw) {
        _this.removeInteraction();
      }
    });

    _this.map.addInteraction(_this.draw);
  }

  /**
   * 修改图形
   * @param type
   */
  modifyGraphic(type) {
    if (type === true) {
      this.removeInteraction();
      this.translate.addSelectInteraction()
    } else {
      this.translate.removeSelectInteraction();
    }
  }

  addFeature(object) {
    let geometry = object.geometry ? object.geometry : null,
      coords = geometry ? geometry.coordinates : null;
    if (!coords && !geometry) {
      return null;
    }
    let radius = 100;
    let type = geometry.type;
    if (type) {
      this.radius = geometry.radius;
    }

    switch (type) {
      case 'RadiusCircle':
        this.drawRadiusCircleFun(coords)
        break;
    }
    this.removeInteraction();

  };

  drawCircle() {
    this.drawGraphic(GraphicType.CIRCLE)
  }

  drawRadiusCircle() {
    this.drawGraphic(GraphicType.RADIUS_CIRCLE)
  }

  drawPoint() {
    this.drawGraphic(GraphicType.POINT)
  }

  drawLineString() {
    this.drawGraphic(GraphicType.LINE_STRING)
  }

  drawPolygon() {
    this.drawGraphic(GraphicType.POLYGON)
  }

  drawBox() {
    this.drawGraphic(GraphicType.BOX)
  }

  drawSquare() {
    this.drawGraphic(GraphicType.SQUARE)
  }


  /**
   * 更新图形，用于更新半径圆，重新设置半径后更新已经绘制的半径圆
   */
  updateFeature() {
    if (this.radiusFeature) {
      if (this.radius > 0) {
        //修改半径
        this.radius = this.radius;
      } else {
        this.radius = 100;
      }
      this.vectorLayer.getSourceVector().removeFeature(this.radiusFeature);
      this.drawRadiusCircleFun(this.radiusCircleCoordinate);
    }

  };

  /**
   * 清除所有绘制的要素
   */
  clearFeature() {
    this.vectorLayer.clearFeature();
    this.radiusFeature = null;
  };

  clear() {
    this.vectorLayer.clearFeature();
    this.radiusFeature = null;
  };

  /**
   * 获取源图层
   */
  getSourceVector() {
    this.vectorLayer.getSourceVector();
  }

  /**
   * 返回绘制的图形
   * @returns [] 一个图形数据
   */
  getFeature() {
    return this.vectorLayer.getSourceVector().getFeatures();
  };

  getFeatureById(id) {
    return this.vectorLayer.getFeatureById(id);
  }

  removeFeature(f) {
    return this.vectorLayer.removeFeature(f);
  }

  /**
   * 设置图层的样式
   * @param style openlayer的样式对象
   */
  setStyle(style) {
    if (style) {
      this.style = this.defaultStyle.setStyle(style);
      if (this.vectorLayer) {
        this.vectorLayer.setStyle(style);
        this.translate.setStyle(style);
      }
    }
  }

  /**
   * 设置绘图时的样式
   * @param style
   */
  setDrawStyle(style) {
    if (style) {
      if (!this.styleFun) {
        this.styleFun = new Styles();
      }
      this.drawStyle = this.styleFun.setStyle(style);
    } else {
      this.drawStyle = null;
    }
  }

  refresh() {
    this.vectorLayer.refresh();
  }

  changed() {
    this.vectorLayer.changed();
    this.translate.changed();
  }

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
}

Draw.getCircle = function (object) {
  let geometry = object.geometry ? object.geometry : null,
    coords = geometry ? geometry.coordinates : null;
  var pr = new ol.proj.Projection({code: 'EPSG:4326'});
  let _radius = 100;
  if (geometry.radius) {
    _radius = geometry.radius;
  }
  let circleIn3857 = new ol.geom.Circle(ol.proj.transform(coords, pr, 'EPSG:3857'), _radius, 'XY');
  let circleIn4326 = circleIn3857.transform('EPSG:3857', pr);
  let circle4326 = new ol.geom.Polygon.fromCircle(circleIn4326, 32, 0);
  let objs = {
    coordinate: circle4326.getCoordinates()[0],
    type: "Polygon",
  };
  return objs;
}
Draw.getCircular = function (object) {
  let geometry = object.geometry ? object.geometry : null,
    coords = geometry ? geometry.coordinates : null;
  let _radius = 100;
  if (geometry.radius) {
    _radius = geometry.radius;
  }
  var circle4326 = new ol.geom.Polygon.circular(coords, _radius, 64);
  let objs = {
    coordinate: circle4326.getCoordinates().getCoordinates()[0],
    type: "Polygon",
  };
  return objs;
}


function createGuid() {
  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default Draw;
