function Geometry() {


}

Geometry.createGuid = function(){
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
Geometry.createFeature = function (item, id) {
    let geometry = item.geometry ? item.geometry : null,
        coords = geometry ? geometry.coordinates : null;
    if (!coords && !geometry) {
        return null;
    }
    let attr = null;
    if (item && item.properties) {
        attr = item.properties;
    }
    let radius = 100;

    if (geometry.radius) {
        radius = geometry.radius;
    }
    let type = geometry.type;

    let g = null;
    switch (type) {
        case 'Point':
            let p = new ol.geom.Point(coords);
            g = new ol.Feature({
                name: id,
                geometry: p
            });
            break;
        case 'LineString':
            let route = new ol.geom.LineString(coords);
            g = new ol.Feature({
                name: id,
                geometry: route
            });
            break;
        case 'Polygon':
            let polygon = new ol.geom.Polygon([coords]);
            g = new ol.Feature({
                name: id,
                geometry: polygon
            });
            break;
        case 'MultiPolygon':
            let MultiPolygon = new ol.geom.MultiPolygon(coords);
            g = new ol.Feature({
                name: id,
                geometry: MultiPolygon
            });
            break;
        case 'RadiusCircle':

            break;
    }
    if (g) {
        for (var int in attr) {
            g.set(int, attr[int]);
        }
        var id = null;
        if (attr && attr.gid) {
            id = attr.gid;
        } else {
            id = Geometry.createGuid();
        }
        g.set("gid", id);
        g.setId(id);
    }
    return g;
}

export default Geometry;
