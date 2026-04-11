/**
 * 创建一个弹出框对象
 * @param map 初始化的map
 * @constructor
 */
import '../../../assets/css/popupRight.css';
import {isDefined} from "../../../common/util";

class PopupsRight {
  constructor(map, options) {
    if (!isDefined(map))
      return;
    let els = document.getElementsByClassName('ol-overlaycontainer-stopevent');//openlayer创建地图后会有这个样式
    if (els && els.length > 0) {
      this.window = document.createElement('div');
      this.window.className = 'ol-popups-right';
      this.window.setAttribute('id', 'popups');
      els[0].appendChild(this.window);

      this.cont = document.createElement('div');
      this.window.appendChild(this.cont);

      this.title = document.createElement('div');
      this.title.className = 'ol-popups-right-title';
      this.title.setAttribute('id', 'ol-popups-right-title')
      this.cont.appendChild(this.title);

      this.content = document.createElement('div');
      this.content.setAttribute('id', 'ol-popups-right-content')
      this.content.className = 'ol-popups-right-content';
      this.cont.appendChild(this.content);
      let _overlay = new ol.Overlay({
        element: this.window,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });
      this.ccbf = function () {

      };
      let that = this;

      this.content.innerHTML = null;
      map.addOverlay(_overlay);
      this.overlay = _overlay;

    }
  }

  /**
   * 设置位置和显示的html
   * @param coordinate [经度，纬度] 要显示的位置
   * @param title string   标题
   * @param html  内容
   */
  setPosition(coordinate, title, html) {
    this.overlay.setPosition(coordinate);
    this.content.innerHTML = html;
    this.title.innerHTML = title;

  }
}

export default PopupsRight;

