import *as turf from "@turf/turf";

function TurfObject() {

}

/**
 * 三个点的夹角 计算点旋转角度,coordinate三个时计算第二个，coordinate两个时计算第一个，coordinate一个时返回0
 * @param coordinate coordinate[{latitude:1, longitude: 1}] 长度为3、或2、或1的坐标数组
 * @returns {null|number}
 */
function rotationAngel(coordinate) {
    if (coordinate !== undefined && coordinate !== null) {
        var angle = null;
        if (coordinate.length == 3) {
            var corA = {lat: coordinate[0][1], lon: coordinate[0][0]};
            var corB = {lat: coordinate[1][1], lon: coordinate[1][0]};
            var corC = {lat: coordinate[2][1], lon: coordinate[2][0]};
            var xBA = corA.lon - corB.lon;
            var yBA = corA.lat - corB.lat;
            var xBC = corC.lon - corB.lon;
            var yBC = corC.lat - corB.lat;
            var vector = [0, 1];//单位正北向量
            var vectorBA = [xBA, yBA];//向量BA
            var vectorBC = [xBC, yBC];//向量Bc
            var angleBCX = Math.atan2(vectorBC[1], vectorBC[0]) * 180 / Math.PI;
            angleBCX = angleBCX < 0 ? 360 + angleBCX : angleBCX;
            var angleBAX = Math.atan2(vectorBA[1], vectorBA[0]) * 180 / Math.PI;
            angleBAX = angleBAX < 0 ? 360 + angleBAX : angleBAX;
            var abc = angleBAX - angleBCX;
            abc = abc < 0 ? 360 + abc : abc;
            angle = -angleBCX - abc / 2 + 180;

        } else if (coordinate.length == 2) {

            var corA = {lat: coordinate[0][1], lon: coordinate[0][0]};
            var corB = {lat: coordinate[1][1], lon: coordinate[1][0]};
            var xAB = corB.lon - corA.lon;
            var yAB = corB.lat - corA.lat;
            var vector = [0, 1];//单位正北向量
            var vectorAB = [xAB, yAB];//向量AB
            var angleY = Math.atan2(vectorAB[1], vectorAB[0]) * 180 / Math.PI;//BC与X轴的夹角，逆时针方向
            angle = (-angleY) + 90;
        } else {
            angle = 0;
        }
        return angle;
    }
    return 0;
}

function getCools(angle, center, radius) {
    let sin, cos, x, y;
    sin = Math.sin(angle * Math.PI / 180);
    cos = Math.cos(angle * Math.PI / 180);
    x = center[0] + radius * sin;
    y = center[1] + radius * cos;
    var left = [x, y];
    angle = angle + 180;
    sin = Math.sin(angle * Math.PI / 180);
    cos = Math.cos(angle * Math.PI / 180);
    x = center[0] + radius * sin;
    y = center[1] + radius * cos;
    var right = [x, y];
    return {
        left: left,
        right: right
    }
}

function getRound(angle, center, radius) {
    var res = [];

    for (var i = 0; i < 19; i++) {
        let sin, cos, x, y;
        var ang = angle + i * 10;
        sin = Math.sin(ang * Math.PI / 180);
        cos = Math.cos(ang * Math.PI / 180);
        x = center[0] + radius * sin;
        y = center[1] + radius * cos;
        res.push([x, y]);
    }
    return res
}

function getPoint(array, radius) {
    if (array.length == 2) {
        let radiu = radius[0] / 100;

        var restlt = {
            left: [],
            right: []
        }
        var length = array.length;
        var sar = [array[0], array[1]];
        var angle = rotationAngel(sar);
        var co0 = getCools(angle + 90, array[0], radiu);
        restlt.left.push(co0.left);
        restlt.right.push(co0.right);
        sar = [array[length - 1], array[length - 2]];
        var angle = rotationAngel(sar);
        radiu = radius[length - 1] / 100;
        var co0 = getCools(angle - 90, array[length - 1], radiu);
        restlt.left.push(co0.left);
        restlt.right.push(co0.right);
        return restlt;
    } else if (array.length > 2) {

        let radiu = radius[0] / 100;

        var restlt = {
            left: [],
            right: []
        }
        var length = array.length;
        var sar = [array[0], array[1]];
        var angle = rotationAngel(sar);
        var co0 = getCools(angle - 90, array[0], radiu);
        restlt.left.push(co0.left);
        restlt.right.push(co0.right);
        for (var i = 1; i < length - 1; i++) {
            sar = [array[i - 1], array[i], array[i + 1]];
            var angle = rotationAngel(sar);
            radiu = radius[i] / 100;
            var coi = getCools(angle - 90, array[i], radiu);
            restlt.left.push(coi.left);
            restlt.right.push(coi.right);
        }

        var sar = [array[length - 1], array[length - 2]];
        var angle = rotationAngel(sar);
        radiu = radius[length - 1] / 100;

        /*var co0 = getCools(angle + 90, array[length - 1], radiu);
        restlt.left.push(co0.left);
        restlt.right.push(co0.right);*/

        co0 = getRound(angle + 90, array[length - 1], radiu);
        restlt.left = restlt.left.concat(co0);
        return restlt;
    }
    var restlt = {
        left: [],
        right: []
    }
    return restlt;

}

/**
 * 获取台风影响范围
 */
TurfObject.typhoonBuffer = function (coordinates, radius) {
    var length = coordinates.length;
    var lt = 50;
    if (length > lt) {

        var ar = []
        for (var i = length - lt; i < length; i++) {
            ar.push(coordinates[i]);
        }
        coordinates = ar;

        length = lt;
    }
    var step = length;
    var radiuar = [];
    var ra = 400;
    var st = 1 / step / 2;
    for (var i = 0; i < step; i++) {
        var ad = ra * (st * i);
        radiuar.push(ad);
    }
    var coor = getPoint(coordinates, radiuar);
    var cos1 = coor.left;
    var cos2 = coor.right.reverse();
    var cos3 = cos1.concat(cos2);

    var polygon1 = turf.polygon([cos3]);
    var buffered = turf.buffer(polygon1, 10, {units: 'kilometers'});

    return buffered;

}

export default TurfObject;
