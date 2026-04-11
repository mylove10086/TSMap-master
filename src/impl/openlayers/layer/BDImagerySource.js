/**
 * Created by  on 2022/3/1.
 */
function BDImagerySource(url) {

    if (!url) {
        url = "https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20220221&scale=1&ak=LPQAVkzSThbmIRI1YVo8VuzwlTrQG9T1&styles=t%3Aland%7Ce%3Ag%7Cc%3A%230A1831%2Ct%3Abuilding%7Ce%3Ag%7Cc%3A%231D325E%2Ct%3Ahighway%7Ce%3Aall%7Cl%3A-42%7Cs%3A-91%2Ct%3Aarterial%7Ce%3Ag%7Cl%3A-77%7Cs%3A-94%2Ct%3Agreen%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Awater%7Ce%3Ag%7Cc%3A%23181818%2Ct%3Asubway%7Ce%3Ag.s%7Cc%3A%23181818%2Ct%3Arailway%7Ce%3Ag%7Cl%3A-52%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23313131%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%238b8787%2Ct%3Amanmade%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Alocal%7Ce%3Ag%7Cc%3A%23ef10adff%7Cl%3A-75%7Cs%3A-91%7Ch%3A%239f2424%2Ct%3Asubway%7Ce%3Ag%7Cl%3A-65%2Ct%3Arailway%7Ce%3Aall%7Cl%3A-40%2Ct%3Aroad%7Ce%3Ag%7Cc%3A%231890ffff%7Cl%3A-69%7Cw%3A1%7Ch%3A%231890ff";
    }
    var projection = ol.proj.get("EPSG:3857");
    var resolutions = [];
    for (var i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
    }
    var tilegrid = new ol.tilegrid.TileGrid({
        origin: [0, 0],
        resolutions: resolutions
    });
    var baidu_source = new ol.source.TileImage({
        projection: projection,
        tileGrid: tilegrid,
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            if (!tileCoord) {
                return "";
            }
            var z = tileCoord[0];
            var x = tileCoord[1];
            var y = -tileCoord[2]-1;

            if (x < 0) {
                x = "M" + (-x);
            }
            if (y < 0) {
                y = "M" + (-y);
            }
            return url.replace('{x}', x).replace('{y}', y).replace('{z}', z);
            //return "https://api.map.baidu.com/customimage/tile?&x=" + x + "&y=" + y + "&z=" + z + "&udt=20220221&scale=1&ak=LPQAVkzSThbmIRI1YVo8VuzwlTrQG9T1&styles=t%3Aland%7Ce%3Ag%7Cc%3A%230A1831%2Ct%3Abuilding%7Ce%3Ag%7Cc%3A%231D325E%2Ct%3Ahighway%7Ce%3Aall%7Cl%3A-42%7Cs%3A-91%2Ct%3Aarterial%7Ce%3Ag%7Cl%3A-77%7Cs%3A-94%2Ct%3Agreen%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Awater%7Ce%3Ag%7Cc%3A%23181818%2Ct%3Asubway%7Ce%3Ag.s%7Cc%3A%23181818%2Ct%3Arailway%7Ce%3Ag%7Cl%3A-52%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23313131%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%238b8787%2Ct%3Amanmade%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Alocal%7Ce%3Ag%7Cc%3A%23ef10adff%7Cl%3A-75%7Cs%3A-91%7Ch%3A%239f2424%2Ct%3Asubway%7Ce%3Ag%7Cl%3A-65%2Ct%3Arailway%7Ce%3Aall%7Cl%3A-40%2Ct%3Aroad%7Ce%3Ag%7Cc%3A%231890ffff%7Cl%3A-69%7Cw%3A1%7Ch%3A%231890ff"
        },
        tileLoadFunction: function (imageTile, src) {
            imageTile.getImage().src = src;
        }
    });
    return baidu_source;

}

export default BDImagerySource;