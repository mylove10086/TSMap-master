/**
 * 在线影像标注管理
 * @param view
 * @constructor
 */

var BasicImagerLayer = {}
BasicImagerLayer.getImageLayer = function (type) {
    var url = null;
    switch (type) {
        case "blue":
            url = "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer";
            break;
        case "community":
            url = "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer";

            break;
        case "gray":
            url = "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer";

            break;
        case "topo":
        default:
            url = "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer";
            //url = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer";

            break;
    }
    let img_w = new ol.layer.Tile({
        source: new ol.source.TileArcGISRest({
            url: url
        }) //
    });
    return img_w;
}


export default BasicImagerLayer;
