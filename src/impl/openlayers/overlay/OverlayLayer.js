import {extend, hasUndefined} from "../../../common/util";
import Styles from "../style/Styles";

/**
 * 覆盖层
 * @param map openlayer的创建的地图map
 * @constructor
 */
class OverlayLayer {

  constructor(map, options) {
    this.map = map;
    this.options = extend(this.getDefaultOptions(), options);

    if (hasUndefined(this.map)) {
      return;
    }

    this.overlays = {};
  }

  getDefaultOptions() {
    return {};
  }

  initOverlay(options) {
    let context = document.createElement('div');

    if (options.url) {
      let el = document.createElement('img');
      context.appendChild(el);
      if (options.height) {
        el.height = options.height;
      }
      if (options.width) {
        el.width = options.width;
      }
      el.src = options.url;
    }

    if (options.text) {
      let el = document.createElement('div');
      context.appendChild(el);
      el.innerText = options.text;
    }
    if (options.html) {
      context.appendChild(options.html);
    }
    let anchor = [0.5, 0.5];
    if (options.anchor) {
      anchor = options.anchor;
    }
    let positioning = 'center-center';
    if (options.positioning) {
      positioning = options.positioning;
    }
    if (options.properties) {
      let that = this;
      context.onclick = function () {
        if (that.onClickFun) {
          that.onClickFun(options.properties);
        }
      }
    }

    return new ol.Overlay({
      element: context,
      positioning: positioning,
      offset: anchor
    });
  }

  getOverlayId(str) {
    return "over_" + str;
  }

  /**
   * 添加一个覆盖物
   * @param options{
                anchor:[0,-64],
                width: 50,
                height: 60,
                position: e.coordinate,
                //'bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center-center', 'center-right', 'top-left', 'top-center', and 'top-right'
                positioning: 'bottom-center',
                url: 'fire1.gif' //url、text、html
            }
   * @returns {null}
   */
  addOverlay(options) {
    let roverlay = null;

    if (options && options.position) {
      let overlay = this.initOverlay(options);

      this.map.addOverlay(overlay);

      overlay.setPosition(options.position);

      this.overlays[this.getOverlayId(overlay.ol_uid)] = overlay;


      roverlay = {
        overlay: overlay,
        element: overlay.getElement(),
        id: overlay.ol_uid
      }
    }

    return roverlay;
  };

  /**
   * 移除指定的overlay
   * @param overlay
   */
  removeOverlay(overlay) {
    let id = this.getOverlayId(overlay.ol_uid);
    let ov = this.overlays[id];

    if (ov) {
      let m = ov.getMap();

      if (m) {
        this.map.removeOverlay(this.overlays[id]);
        delete this.overlays[id];
      }
    }
  };

  setOnClickCallback(callback) {
    this.onClickFun = callback;
  };

  /**
   * 设置图层的可见性
   * @param visible true/false
   */
  setVisible(visible) {
    if (visible) {
      for (let item in this.overlays) {
        let m = this.overlays[item].getMap();
        if (!m) {
          this.map.addOverlay(this.overlays[item]);
        }
      }
    } else {
      for (let item in this.overlays) {
        let m = this.overlays[item].getMap();

        if (m) {
          this.map.removeOverlay(this.overlays[item]);
        }
      }
    }
  };

  /**
   * 移除图层,移除后需要用 setDataSource从新添加
   */
  removeLayer() {
    for (let item in this.overlays) {
      let m = this.overlays[item].getMap();

      if (m) {
        this.map.removeOverlay(this.overlays[item]);
      }

      delete this.overlays[item];
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


  /**
   * 清空图层
   */
  clear() {
    this.removeLayer();
  };

  /**
   * 通过id获取覆盖层的一个覆盖物
   * @param id
   */
  getOverLay(id) {
    return this.overlays[this.getOverlayId(id)];
  }
}

export default OverlayLayer;
