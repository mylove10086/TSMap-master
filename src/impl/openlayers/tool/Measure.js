/**
 * 测量面积和距离
 * @param map 初始化的map
 * @returns {*} draw
 * @constructor
 */
import VectorLayer from "../layer/VectorLayer";
import Styles from "../style/Styles";

class Measure {
  constructor(map, options) {
    this.map = map;
    this.draw = null; // global so we can remove it later
    this.drawStyle = null;//绘图时的样式
    // 绘制完一次后是否结束绘图
    this.isEndDraw = true;
    this.tip = false;//是否显示标签
    this.color = '#ffffff';//字体颜色
    this.fill = 'rgba(163,64,64,0.47)';//字体背景颜色
    this.vl = new VectorLayer(map,);
    this.mouseFun = function (e) {
      //console.log(e);
    };
    /**
     * Format area output.
     * @param {Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
    this.formatArea = function (polygon) {

      let area = ol.sphere.getArea(polygon);
      let output;
      /*if (area > 10000) {
          output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km2';
      } else {
          output = Math.round(area * 100) / 100 + ' ' + 'm2';
      }*/
      output = Math.round(area * 100) / 100;
      return output;
    };

    this.formatLength = function (line) {
      let length = ol.sphere.getLength(line);
      let output;

      output = Math.round(length * 100) / 100;
      return output;
    };
    let that = this;
    this.canvasFun = function (string) {
      // 绘制圆角矩形
      let canvas = document.createElement('canvas')
      let context = canvas.getContext('2d')
      let length = string.length;
      canvas.width = length * 13
      canvas.height = 30
      let x = 5
      let y = 0
      let w = canvas.width
      let h = canvas.height
      let r = 5
      // 缩放
      context.scale(0.8, 0.8);
      context.fillStyle = this.fill;
      // 绘制圆角矩形
      context.beginPath()
      context.moveTo(x + r, y)
      context.arcTo(x + w, y, x + w, y + h, r)
      context.arcTo(x + w, y + h, x, y + h, r)
      context.arcTo(x, y + h, x, y, r)
      context.arcTo(x, y, x + w, y, r)
      // 设置阴影
      context.shadowColor = 'rgba(208,146,53,0.2)' // 颜色
      context.shadowBlur = 5 // 模糊尺寸
      context.shadowOffsetX = 2 // 阴影Y轴偏移
      context.shadowOffsetY = 2 // 阴影X轴偏移
      // ----
      context.closePath()
      // 填充
      context.fill()
      return {
        canvas: canvas,
        w: w,
        h: h
      };
    }
    this.getStyle = function (m) {
      var obj = that.canvasFun("" + m);
      var et = new ol.style.Text({
        textAlign: 'left',
        textBaseline: 'bottom',
        font: 'Arial',
        text: "" + m,
        scale: 1.5,
        offsetX: 10.5,
        offsetY: -1.5,
        fill: new ol.style.Fill({color: this.color}),
      });
      var ess = new ol.style.Style({
        image: new ol.style.Icon({
          img: obj.canvas,
          imgSize: [obj.w, obj.h],
          anchor: [0, 1]
        }),
        text: et
      });
      return ess;
    }
    this.centerPoint = null;
    this.endPoint = null;
  }

  /**
   * 停止绘图
   */
  removeInt() {
    if (this.draw)
      this.map.removeInteraction(this.draw);
    this.centerPoint = null;
    this.endPoint = null;
    this.draw = null;
  }

  /**
   * 绘制图形初始化函数
   * @param type
   */
  initGraphic(type) {
    this.removeInt();
    let value = null;
    switch (type) {
      case 'Point':
        value = null;
        break;
      case 'length':
        value = "LineString";
        break;
      case 'plength':
        value = "Polygon";
        break;
      default:
        value = "Polygon";
        break;
    }
    if (value) {
      this.draw = new ol.interaction.Draw({
        source: this.vl.getSourceVector(),
        type: value,
        stopClick: true,
        style: this.drawStyle
      });
      let listener;
      let sketch;
      let that = this;
      this.draw.on('drawstart', function (evt1) {
        // set sketch
        sketch = evt1.feature;
        let index = 0;
        listener = sketch.getGeometry().on('change', function (evt) {
          let geom = evt.target;
          let output;
          let len;
          if (geom instanceof ol.geom.Polygon) {
            let p = geom.clone();
            let circleIn3857 = p.transform(that.map.getView().getProjection(), 'EPSG:3857');
            let area = that.formatArea(circleIn3857);
            len = that.formatLength(circleIn3857);
            if (that.tip) {
              let center = ol.extent.getCenter(geom.getExtent());   //获取边界区域的中心位置
              let p = new ol.geom.Point(center);
              if (!that.centerPoint) {
                that.centerPoint = new ol.Feature({
                  geometry: p
                })
                that.vl.getSourceVector().addFeature(that.centerPoint);
              }
              let m = area.toFixed(4) + "m²";
              if (area > 10000) {
                m = area / 1000000
                m = m.toFixed(4) + "km²";
              }
              var sss = that.getStyle(m);
              that.centerPoint.setGeometry(p);
              that.centerPoint.setStyle(sss);

              let lentg = geom.flatCoordinates.length;
              let ep = new ol.geom.Point([geom.flatCoordinates[lentg - 4], geom.flatCoordinates[lentg - 3]]);
              if (!that.endPoint) {
                that.endPoint = new ol.Feature({
                  geometry: ep
                })
                that.vl.getSourceVector().addFeature(that.endPoint);
              }
              let l = len.toFixed(2) + "m";
              if (len > 1000) {
                l = len / 1000
                l = l.toFixed(2) + "km";
              }
              var ess = that.getStyle(l);
              that.endPoint.setGeometry(ep);
              that.endPoint.setStyle(ess);

            }
            output = {
              area: area,
              distance: len
            }
          } else if (geom instanceof ol.geom.LineString) {
            let p = geom.clone();
            let circleIn3857 = p.transform(that.map.getView().getProjection(), 'EPSG:3857');
            len = that.formatLength(circleIn3857);
            if (that.tip) {
              let lentg = geom.flatCoordinates.length;
              //鼠标移动点的标注
              let ep = new ol.geom.Point([geom.flatCoordinates[lentg - 2], geom.flatCoordinates[lentg - 1]]);
              if (!that.endPoint) {
                that.endPoint = new ol.Feature({
                  geometry: ep
                })
                that.vl.getSourceVector().addFeature(that.endPoint);
              }
              let l = len.toFixed(2) + "m";
              if (len > 1000) {
                l = len / 1000
                l = l.toFixed(2) + "km";
              }
              var ess = that.getStyle(l);
              that.endPoint.setGeometry(ep);
              that.endPoint.setStyle(ess);
              if ((lentg - index) >= 2 && lentg > 4) {
                let cp = new ol.geom.Point([geom.flatCoordinates[lentg - 2], geom.flatCoordinates[lentg - 1]]);
                let cPoint = new ol.Feature({
                  geometry: cp
                })
                that.vl.getSourceVector().addFeature(cPoint);
                index = lentg;
                cPoint.setGeometry(ep);
                cPoint.setStyle(ess);
              }
            }
            output = {
              area: null,
              distance: len
            }
          }
          if (that.mouseFun)
            that.mouseFun(output);
        });
      });
      this.draw.on('drawend', function (e) {
        sketch = null;
        ol.Observable.unByKey(listener);
        if (that.isEndDraw) {
          that.removeInt();
        }
      });
      this.map.addInteraction(this.draw);
    }
  }

  /**
   * 设置鼠标移动到回调函数
   * 长度以米为单位
   * 面积以平方米为单位
   * @param fun
   */

  setMouseCallback(fun) {
    this.mouseFun = fun
  };

  /**
   * 开始量测
   * @param object{type:length/area}
   */
  startMeasuring(object) {
    this.initGraphic(object.type);
  };

  /**
   * 清除所有绘制的要素
   */

  clear() {
    this.removeInt();
    this.vl.clearFeature();
  };


  /**
   * 获取经纬度坐标数组的距离
   * @param object{coordinate: [[经度,纬度]] //长度大于等于2}
   */
  getXYLength(object) {
    if (object.coordinate.length >= 2) {
      let ls = new ol.geom.LineString(object.coordinate);
      let p = ls.clone();
      let circleIn3857 = p.transform(this.map.getView().getProjection(), 'EPSG:3857');
      return this.formatLength(circleIn3857);
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

      this.vl.setStyle(style);
      if (style.text.color)
        this.color = style.text.color;//字体颜色
      if (style.text.fill)
        this.fill = style.text.fill;//字体背景颜色
    }

  };

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

  setZIndex(index) {
    this.vl.setZIndex(index);

  }
}

Measure.distanceXY = function (object, map) {
  if (object && object.coordinate.length >= 2) {
    let ls = new ol.geom.LineString(object.coordinate);
    let p = ls.clone();
    let circleIn3857 = p.transform(map.getView().getProjection(), 'EPSG:3857');
    return Measure.formatLength(circleIn3857);
  }
  return 0;
}
Measure.ringArea = function (object, map) {
  if (object && object.coordinate.length >= 3) {
    let ls = new ol.geom.Polygon([object.coordinate]);
    let p = ls.clone();
    let circleIn3857 = p.transform(map.getView().getProjection(), 'EPSG:3857');
    return Measure.formatAreas(circleIn3857);
  }
  return 0;

}
Measure.formatAreas = function (polygon) {

  let area = ol.sphere.getArea(polygon);
  let output;
  /*if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km2';
  } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm2';
  }*/
  output = Math.round(area * 100) / 100;
  return output;
};
Measure.formatLength = function (line) {
  let length = ol.sphere.getLength(line);
  let output;
  output = Math.round(length * 100) / 100;
  return output;
};
export default Measure;
