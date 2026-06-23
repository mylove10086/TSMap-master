import Styles from "../style/Styles";
import {GraphicType} from "../../../map/TsMapConstants";
import Algorithm from "../common/algorithnm/Algorithm";

/**
 * Created by  on 2022/2/14.
 */

function Translate(map, layer, source) {
  var project = map.getView().getProjection()

  var select = new ol.interaction.Select({
    layers: [layer],
    style: null
  });
  var sourceVector = new ol.source.Vector();
  var layerVector = new ol.layer.Vector({
    source: sourceVector,
  });

  var translate = new ol.interaction.Translate({
    layers: [layerVector]
  });

  map.addLayer(layerVector);
  let zindex = map.getLayers().getLength();
  layerVector.setZIndex(zindex);
  var feature = null;
  var point = [];
  var controlPoint = [];
  var stroke = new ol.style.Stroke({
    color: '#e59e32',
    width: 1.25,
  });
  var style = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: 'rgba(243,121,28,0.74)'
      }),
      stroke: stroke
    })
  });

  var callbackfun = null;

  function resultfun(feature, action) {
    if (callbackfun && feature) {
      var coordinate = feature.getGeometry().getCoordinates();
      var type = feature.getGeometry().getType();
      switch (type) {
        case  GraphicType.POLYGON:
          coordinate = coordinate[0];
          break;

      }
      let obj = {
        coordinate: coordinate,
        controlPoint: feature.get('controlPoint'),
        type: feature.getGeometry().getType(),
        action: action,
        gid: feature.getId()
      };
      callbackfun(feature, obj);
    }
  }

  select.on('select', function (e) {
    if (e.selected.length > 0) {
      resultfun(feature, 'modify');
      selectEnd();
      feature = e.selected[0];
      var graphicType = feature.get("graphicType");
      switch (graphicType) {
        case GraphicType.POLYGON:
          controlPoint = feature.getGeometry().getCoordinates()[0]
          addPoint(controlPoint);

          break;
        case GraphicType.LINE_STRING:
          controlPoint = feature.getGeometry().getCoordinates();
          addPoint(controlPoint);

          break;
        case GraphicType.POINT:
        case GraphicType.TEXT:
          var item = feature.getGeometry().getCoordinates();
          var p = new ol.geom.Point(item);
          var g = new ol.Feature({
            geometry: p,
          });
          g.index = 0;
          g.setStyle(style);
          point.push({feature: g, index: 0});
          sourceVector.addFeature(g);
          break;
        case GraphicType.FINEARROW:
        case GraphicType.CIRCLE:
        case GraphicType.ATTACKARROW:
        case GraphicType.PINCERARROW:
        case GraphicType.BOX:
        case GraphicType.SQUARE:
        case GraphicType.CurveAlgorithm:
        case GraphicType.EllipseGeom:
          controlPoint = feature.get("controlPoint");
          addPoint(controlPoint);
          break;
      }
      source.removeFeature(feature);
      sourceVector.addFeature(feature);
      resultfun(feature, 'select');
    } else {
      resultfun(feature, 'modify');
      selectEnd();
      feature = null;
    }
  });

  function addPoint(coordinates) {
    for (var i = 0; i < coordinates.length; i++) {
      var item = coordinates[i]
      var p = new ol.geom.Point(item);
      var g = new ol.Feature({
        geometry: p
      });
      g.setStyle(style);
      g.index = i;
      point.push({feature: g, index: i});
      sourceVector.addFeature(g);
    }
  }

  var spoint = null;

  /**
   * 计算点的平移
   * @param startCoordinate
   * @param coordinate
   */
  function calculateTran(startCoordinate, endCoordinate) {
    if (!spoint) {
      spoint = startCoordinate;
    }
    var deltaX = endCoordinate[0] - spoint[0];
    var deltaY = endCoordinate[1] - spoint[1];
    for (var i = 0; i < controlPoint.length; i++) {
      var item = controlPoint[i];
      item[0] = item[0] + deltaX;
      item[1] = item[1] + deltaY;
      point[i].feature.getGeometry().setCoordinates(item);
      controlPoint[i] = item;
    }
    spoint = endCoordinate;
  }

  var circleFun = new ol.interaction.Draw.createRegularPolygon(32);
  var boxFun = new ol.interaction.Draw.createBox();
  var squareFun = new ol.interaction.Draw.createRegularPolygon(4);

  translate.on('translating', function (e) {
    var array = e.features.getArray()
    var g = array[0]
    var type = g.getGeometry().getType();
    if (type !== 'Point') {
      var graphicType = feature.get("graphicType");
      switch (graphicType) {
        case GraphicType.POLYGON:
          controlPoint = g.getGeometry().getCoordinates()[0];
          for (var i = 0; i < controlPoint.length; i++) {
            var item = controlPoint[i]
            point[i].feature.getGeometry().setCoordinates(item);
          }
          break;
        case GraphicType.LINE_STRING:
          controlPoint = g.getGeometry().getCoordinates();
          for (var i = 0; i < controlPoint.length; i++) {
            var item = controlPoint[i]
            point[i].feature.getGeometry().setCoordinates(item);
          }
          break;
        case GraphicType.FINEARROW:
          controlPoint = g.getGeometry().getCoordinates()[0];
          var item0 = controlPoint[7];
          point[0].feature.getGeometry().setCoordinates(item0);
          var item1 = controlPoint[3];
          point[1].feature.getGeometry().setCoordinates(item1);
          break;
        case GraphicType.ATTACKARROW:
        case GraphicType.CIRCLE:
        case GraphicType.PINCERARROW:
        case GraphicType.BOX:
        case GraphicType.SQUARE:
        case GraphicType.CurveAlgorithm:
        case GraphicType.EllipseGeom:
          calculateTran(e.startCoordinate, e.coordinate);
          break;
      }
    } else {
      var graphicType = feature.get("graphicType");
      switch (graphicType) {
        case GraphicType.POLYGON:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          feature.getGeometry().setCoordinates([controlPoint]);
          break;
        case GraphicType.LINE_STRING:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          feature.getGeometry().setCoordinates(controlPoint);
          break;
        case GraphicType.POINT:
        case GraphicType.TEXT:
          if (g.get("graphicType")) {
            var item = feature.getGeometry().getCoordinates();
            point[0].feature.getGeometry().setCoordinates(item);
          } else {
            var item = g.getGeometry().getCoordinates();
            feature.getGeometry().setCoordinates(item);
          }
          break;
        case GraphicType.FINEARROW:
          controlPoint[0] = point[0].feature.getGeometry().getCoordinates();
          controlPoint[1] = point[1].feature.getGeometry().getCoordinates();
          var positions = Algorithm.fineArrow(controlPoint[0], controlPoint[1]);
          feature.getGeometry().setCoordinates([positions]);
          break;
        case GraphicType.CIRCLE:
          controlPoint[0] = point[0].feature.getGeometry().getCoordinates();
          controlPoint[1] = point[1].feature.getGeometry().getCoordinates();
          var geometry = circleFun(controlPoint, null, project);
          feature.getGeometry().setCoordinates(geometry.getCoordinates());
          break;
        case GraphicType.ATTACKARROW:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          var positions = Algorithm.tailedAttackArrow(controlPoint);
          feature.getGeometry().setCoordinates([positions.polygonalPoint]);
          break
        case GraphicType.PINCERARROW:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          var positions = Algorithm.doubleArrow(controlPoint);
          feature.getGeometry().setCoordinates([positions.polygonalPoint]);
          break;
        case GraphicType.BOX:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          var geometry = boxFun(controlPoint, null, project);
          feature.getGeometry().setCoordinates(geometry.getCoordinates());
          break;
        case GraphicType.SQUARE:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          var geometry = squareFun(controlPoint, null, project);
          feature.getGeometry().setCoordinates(geometry.getCoordinates());
          break;
        case GraphicType.CurveAlgorithm:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          var positions = Algorithm.getCurveAlgorithm(controlPoint);
          feature.getGeometry().setCoordinates(positions);
          break;
        case GraphicType.EllipseGeom:
          var s = g.getGeometry().getCoordinates();
          controlPoint[g.index] = s;
          var geometry = Algorithm.getEllipseGeom(controlPoint,  feature.getGeometry(), project);
          //feature.getGeometry().setCoordinates(geometry.getCoordinates());
          break;
      }
    }
  });

  translate.on('translateend', function (e, f) {
    spoint = null;
  });

  function selectEnd() {
    if (feature) {
      var graphicType = feature.get("graphicType");
      switch (graphicType) {
        case GraphicType.POLYGON:
          feature.set("controlPoint", feature.getGeometry().getCoordinates());
          break;
        case GraphicType.LINE_STRING:
          feature.set("controlPoint", feature.getGeometry().getCoordinates());
          break;
        case GraphicType.FINEARROW:
        case GraphicType.ATTACKARROW:
        case GraphicType.CIRCLE:
        case GraphicType.CurveAlgorithm:
        case GraphicType.EllipseGeom:
          var controlPoint1 = [];
          for (var i = 0; i < point.length; i++) {
            controlPoint1.push(point[i].feature.getGeometry().getCoordinates());
          }
          feature.set("controlPoint", controlPoint1);
          break;
        case GraphicType.POINT:
        case GraphicType.TEXT:
          feature.set("controlPoint", feature.getGeometry().getCoordinates());
          break;
      }
      source.addFeature(feature);
      sourceVector.clear();
    }
    point = [];
    feature = null;

  }

  this.addSelectInteraction = function () {
    map.addInteraction(select);
    map.addInteraction(translate);


  }

  this.removeSelectInteraction = function () {
    selectEnd();
    map.removeInteraction(select);
    map.removeInteraction(translate);


  }
  this.setStyle = function (style) {
    if (style) {
      if (!this.defaultStyle) {
        this.defaultStyle = new Styles();
      }
      layerVector.setStyle(this.defaultStyle.setStyle(style));
    } else {
      return;
    }
  }
  this.setCallback = function (fun) {
    callbackfun = fun;
  }
  this.changed = function () {
    sourceVector.changed();

  }

}

export default Translate;

