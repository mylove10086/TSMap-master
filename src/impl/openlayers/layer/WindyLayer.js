import {isDefined} from "../../../common/util";
import Windy from "./Windy";


class WindyLayer {
  constructor(map, options) {
    if (!isDefined(map))
      return;
    this.map = map;
    this._canvas = null;

    this.imageCanvasSource = new ol.source.ImageCanvas({
      canvasFunction: canvasFun,
      ratio: 1
    });
    this.imageLayer = new ol.layer.Image({
      source: this.imageCanvasSource
    });

    map.addLayer(this.imageLayer);
    var that = this;

    this.dataWindy = null;

    function canvasFun(extent, resolution, pixelRatio, size, projection) {
      if (!that._canvas) {
        that._canvas = createCanvas(size[0], size[1]);
      } else {
        that._canvas.width = size[0];
        that._canvas.height = size[1];
      }
      if (resolution <= that.imageLayer.get('maxResolution')) {
        that.render(that._canvas);
      } else {

      }
      return that._canvas;
    }

    this.$Windy = null;
    this.status = false;//是否启动风的状态

    this.render = function () {
      if (that._canvas && !that.$Windy) {
        if (that.dataWindy) {
          that.$Windy = new Windy({
            canvas: that._canvas,
            projection: "EPSG:4326",
            data: that.dataWindy,
          });
        }
      }
      if (that.status && that.$Windy) {
        var size = that.map.getSize();
        var extent1;
        var _extent = that.map.getView().calculateExtent();
        if (size && _extent) {
          var _projection = that.map.getView().getProjection();
          var extent = ol.proj.transformExtent(_extent, _projection, 'EPSG:4326');
          extent1 = [[[0, 0], [size[0], size[1]]], size[0], size[1], [[extent[0], extent[1]], [extent[2], extent[3]]]];
        }
        that.$Windy.start(extent1[0], extent1[1], extent1[2], extent1[3]);
      }
      that.prenderFun();
    };

    this.prenderFun = function () {
      that.map.render();
    };
    this.contains = function () {
      return false;
    }

    this.setStyle = function () {

    }
    this.clear = function () {
      this.stopWindy();
    }
  }

  /**
   * 设置图层的可见性
   * @param visible true/false
   */
  setVisible(visible) {
    this.imageLayer.setVisible(visible);
  };

  getVisible() {
    return this.imageLayer.getVisible();
  };

  /**
   * 移除图层
   */
  removeLayer() {
    this.status = false;
    if (this.$Windy)
      this.$Windy.stop();
    this.map.removeLayer(this.imageLayer);
    this.imageLayer.un('postrender', this.prenderFun);
  };

  /**
   * 添加windy图层
   */
  addLayer() {
    this.map.removeLayer(this.imageLayer);
    this.map.addLayer(this.imageLayer);
  };

  /**
   * 停止风
   */
  stopWindy() {
    this.status = false;
    this.imageLayer.un('postrender', this.prenderFun);
    if (this.$Windy)
      this.$Windy.stop();
  };

  /**
   * 从新启动风
   */
  startWindy() {
    this.status = true;
    this.imageLayer.on('postrender', this.prenderFun);
    this.imageCanvasSource.refresh();
    this.render();//重新启动

  };

  /**
   * 更新风场的数据
   * @param object {data:}
   */
  addFeature(object) {
    if (this.$Windy)
      this.$Windy.setData(object.data);
    this.dataWindy = object.data;
  }

  setZIndex(index) {

  }
}

function createCanvas(size, Canvas) {
  //每次的范围变动都会引起重绘，从而触发该回调函数，
  if (typeof document !== 'undefined') {
    let canvas = document.createElement('canvas');
    //let canvas = document.getElementById('canvasid');
    canvas.id = "canvas1111";
    canvas.width = size[0];
    canvas.height = size[1];
    return canvas;
  } else {
    return new Canvas(size[0], size[1]);
  }
}

export default WindyLayer;

