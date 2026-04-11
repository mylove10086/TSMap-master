/**
 * 在线地图
 * @constructor
 */
function OnlineLFMap(options) {
    var _key = options.key;

    let baseUrl = "http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G";
    let _rootLayer = new L.tileLayer(baseUrl);

    //影像地图
    let img_w_url = "http://t{s}.tianditu.gov.cn/img_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" + _key;

    let img_w = new L.tileLayer(img_w_url, {
        subdomains: "12345"
    });
    //影像注记
    let cia_w_url = "http://t{s}.tianditu.gov.cn/cia_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" + _key;

    let cia_w = new L.tileLayer(cia_w_url, {
        subdomains: "12345"
    });


    //矢量底图
    let vec_c_url = "http://t{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=" + _key;
    let vec_c = new L.tileLayer(vec_c_url, {
        subdomains: "12345"
    });
    //矢量注记
    let cva_w_url = "http://t{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=" + _key;
    let cva_w = new L.tileLayer(cva_w_url, {
        subdomains: "12345"
    });

    this.getLFMapImg = function (type) {
        switch (type) {
            case 'vec_c':
                return vec_c;//天地图矢量底图
            case 'cva_w':
                return cva_w;//天地图矢量注记
            case 'cia_w':
                return cia_w;//天地图影像注记
            case 'img_w':
                return img_w;//天地图影像地图
            case 'img_g':
                return _rootLayer;//谷歌影像地图
            default:
                return _rootLayer;//谷歌影像地图
        }

    }


}

export default OnlineLFMap;