/**
 * 创建一个弹出框对象
 * @param map 初始化的map
 * @constructor
 */
import '../../../assets/css/OlSelectionIndicator.css';
import {isDefined} from "../../../common/util";

class SelectionIndicator {
    constructor(map, options) {
        if (!isDefined(map))
            return;
        let els = document.getElementsByClassName('ol-overlaycontainer-stopevent');//openlayer创建地图后会有这个样式
        if (els && els.length > 0) {

            //this._container = container;

            let el = document.createElement('div');
            el.className = 'ol-selection-wrapper';
            el.setAttribute('data-bind', 'style: { "top" : _screenPositionY, "left" : _screenPositionX },\
css: { "ol-selection-wrapper-visible" : isVisible }');
            //container.appendChild(el);
            this._element = el;
            let svgNS = 'http://www.w3.org/2000/svg';
            let path = 'M -34 -34 L -34 -11.25 L -30 -15.25 L -30 -30 L -15.25 -30 L -11.25 -34 L -34 -34 z M 11.25 -34 L 15.25 -30 L 30 -30 L 30 -15.25 L 34 -11.25 L 34 -34 L 11.25 -34 z M -34 11.25 L -34 34 L -11.25 34 L -15.25 30 L -30 30 L -30 15.25 L -34 11.25 z M 34 11.25 L 30 15.25 L 30 30 L 15.25 30 L 11.25 34 L 34 34 L 34 11.25 z';
            let svg = document.createElementNS(svgNS, 'svg:svg');
            svg.setAttribute('width', 160);
            svg.setAttribute('height', 160);
            svg.setAttribute('viewBox', '0 0 160 160');
            let group = document.createElementNS(svgNS, 'g');
            group.setAttribute('transform', 'translate(80,80)');
            svg.appendChild(group);
            let pathElement = document.createElementNS(svgNS, 'path');
            pathElement.setAttribute('data-bind', 'attr: { transform: _transform }');
            pathElement.setAttribute('d', path);
            group.appendChild(pathElement);
            el.appendChild(svg);

            els[0].appendChild(el);

            let _overlay = new ol.Overlay({
                element: el,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250,
                },
            });

            let that = this;

            map.addOverlay(_overlay);
            this.overlay = _overlay;
        }
    }
    /**
     * 设置位置和显示的html
     * @param coordinate [经度，纬度] 要显示的位置
     */
    setPosition(coordinate){
        this.overlay.setPosition(coordinate);
    };
}



export default SelectionIndicator;
