/**
 * 创建一个弹出框对象,默认单击地图是关闭窗体
 * @param map 初始化的map
 * @constructor
 */
import '../../../assets/css/popup.css';
import {isDefined} from "../../../common/util";

class Popups {
    constructor(map, options) {
        if (!isDefined(map))
            return;
        /*let els = document.getElementsByClassName('ol-overlaycontainer-stopevent');//openlayer创建地图后会有这个样式
        if (els && els.length > 0) {*/
        this.window = document.createElement('div');
        this.window.className = 'ol-popups';
        this.window.setAttribute('id', 'popups');
        //els[0].appendChild(this.window);

        this.title = document.createElement('div');
        this.title.className = 'ol-popups-title';
        this.title.setAttribute('id', 'ol-popups-title')
        this.window.appendChild(this.title);

        this.closer = document.createElement('a');
        this.closer.className = 'ol-popups-closer';
        this.closer.setAttribute('id', 'popups-closer')
        this.window.appendChild(this.closer);


        /*this.main = document.createElement('div');
        this.main.className = 'ol-popups-content';
        this.main.setAttribute('id', 'ol-popups-main')
        this.window.appendChild(this.main);*/

        this.content = document.createElement('div');
        this.content.setAttribute('id', 'ol-popups-content')
        this.window.appendChild(this.content);

        this.trace = document.createElement('div');
        this.trace.className = 'ol-popups-before';
        this.window.appendChild(this.trace);


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
        /**
         * Add a click handler to hide the popup.
         * @return {boolean} Don't follow the href.
         */

        this.closer.onclick = function () {
            _overlay.setPosition(undefined);
            that.closer.blur();
            that.ccbf();
            return false;
        };
        this.content.innerHTML = null;
        map.addOverlay(_overlay);
        this.overlay = _overlay;
        /*}*/
    }

    /**
     * 关闭窗体
     */
    close() {
        this.overlay.setPosition(undefined);
        this.ccbf();
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

    /**
     * 关闭时的回调函数
     * @param fun
     */
    closeCallBack(fun) {
        this.ccbf = fun;
    }
}


export default Popups;
