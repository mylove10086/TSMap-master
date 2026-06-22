import *as turf from "@turf/turf";

var PlotUtils = {
    TWO_PI: 2 * Math.PI,
    HALF_PI: Math.PI / 2,
    FITTING_COUNT: 100,
    ZERO_TOLERANCE: 1e-4
};
var doubleArrowDefualParam = {
    type: "doublearrow",
    headHeightFactor: .25,
    headWidthFactor: .3,
    neckHeightFactor: .85,
    fixPointCount: 4,
    neckWidthFactor: .15
}
var tailedAttackArrowDefualParam = {
    headHeightFactor: .18,
    headWidthFactor: .3,
    neckHeightFactor: .85,
    neckWidthFactor: .15,
    tailWidthFactor: .1,
    headTailFactor: .8,
    swallowTailFactor: 1
};
var fineArrowDefualParam = {
    tailWidthFactor: 0.15,
    neckWidthFactor: 0.20,
    headWidthFactor: 0.25,
    headAngle: Math.PI / 8.5,
    neckAngle: Math.PI / 13
};

function het(e, t) {
    var i;
    return (i = t.x === e.x ? t.y >= e.y ? -Math.PI / 2 : Math.PI / 2 : Math.atan2(e.y - t.y, t.x - e.x)) < 0 && (i += 2 * Math.PI),
    180 * i / Math.PI
}

function matrixSolve(e, t, i) {
    i = i || e.length;
    for (var r = [], n = [], o = 0; o < i; o++)
        n[o] = r[o] = e[o] / t[1][o];
    for (var a = 0; a < 10; a++) {
        r[0] = (e[0] - t[2][0] * n[1]) / t[1][0];
        for (o = 1; o < i - 1; o++)
            r[o] = (e[o] - t[0][o] * n[o - 1] - t[2][o] * n[o + 1]) / t[1][o];
        r[i - 1] = (e[i - 1] - t[0][i - 1] * n[i - 2]) / t[1][i - 1];
        for (o = 0; o < i; o++)
            n[o] = r[o]
    }
    for (o = 0; o < i; o++)
        e[o] = r[o]
}

PlotUtils.bTypeline = function (e, t) {
    var i, r, n = [], o = [], a = [], s = [], l = [], c = [], u = [],
        h = [], d = [], p = [[], [], []];
    for (t = t || e.length, w = 0; w < t; w++)
        n[w] = e[w].x, o[w] = e[w].y;
    for (w = 0; w < t - 1; w++)
        a[w] = n[w + 1] - n[w], s[w] = o[w + 1] - o[w];
    for (i = Math.sqrt(a[0] * a[0] + s[0] * s[0]), w = 0; w < t - 2; w++)
        r = Math.sqrt(a[w + 1] * a[w + 1] + s[w + 1] * s[w + 1]), d[w] = i / r, i = r;
    for (w = d[t - 2] = 1; w < t - 1; w++)
        p[0][w] = 1, p[1][w] = 2 * d[w - 1] * (1 + d[w - 1]), p[2][w] = d[w - 1] * d[w - 1] * d[w];
    for (p[1][0] = 2, p[2][0] = d[0], p[0][t - 1] = 1, p[1][t - 1] = 2 * d[t - 2], w = 1; w < t - 1; w++)
        l[w] = 3 * (a[w - 1] + d[w - 1] * d[w - 1] * a[w]), c[w] = 3 * (s[w - 1] + d[w - 1] * d[w - 1] * s[w]);
    for (l[0] = 3 * a[0], c[0] = 3 * s[0], l[t - 1] = 3 * a[t - 2], c[t - 1] = 3 * s[t - 2], matrixSolve(l, p), matrixSolve(c, p), w = 0; w < t - 1; w++)
        u[w] = d[w] * l[w + 1], h[w] = d[w] * c[w + 1];
    for (var f, m, g, y, v, _, x = 0, b = [], C = [], w = 0; w < t - 1; w++) {
        f = 200 < (_ = parseInt(Math.max(Math.abs(a[w]), Math.abs(s[w])))) ? 200 : _ + 100,
            b[x] = n[w],
            C[x] = o[w],
            x++;
        for (var P = 1; P <= f; P++)
            g = (m = P / f) * m * (3 - 2 * m), y = m * (m - 1) * (m - 1), v = m * m * (m - 1), b[x] = n[w] + a[w] * g + l[w] * y + u[w] * v, C[x] = o[w] + s[w] * g + c[w] * y + h[w] * v, x++
    }
    var S = [];
    for (w = 0; w < b.length; w++) {
        S.push({
            x: b[w],
            y: C[w]
        });
    }
    return S
}
PlotUtils.distance = function (t, o) {
    return Math.sqrt(Math.pow(t[0] - o[0], 2) + Math.pow(t[1] - o[1], 2))
};
PlotUtils.wholeDistance = function (t) {
    for (var o = 0, e = 0; e < t.length - 1; e++) o += PlotUtils.distance(t[e], t[e + 1]);
    return o
};
PlotUtils.getBaseLength = function (t) {
    return Math.pow(PlotUtils.wholeDistance(t), .99)
};
PlotUtils.mid = function (t, o) {
    return [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
};
PlotUtils.getCircleCenterOfThreePoints = function (t, o, e) {
    var r = [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2],
        n = [r[0] - t[1] + o[1], r[1] + t[0] - o[0]],
        g = [(t[0] + e[0]) / 2, (t[1] + e[1]) / 2],
        i = [g[0] - t[1] + e[1], g[1] + t[0] - e[0]];
    return PlotUtils.getIntersectPoint(r, n, g, i)
};
PlotUtils.getIntersectPoint = function (t, o, e, r) {
    if (t[1] == o[1]) {
        var n = (r[0] - e[0]) / (r[1] - e[1]),
            g = n * (t[1] - e[1]) + e[0],
            i = t[1];
        return [g, i]
    }
    if (e[1] == r[1]) {
        var s = (o[0] - t[0]) / (o[1] - t[1]);
        return g = s * (e[1] - t[1]) + t[0], i = e[1], [g, i]
    }
    return s = (o[0] - t[0]) / (o[1] - t[1]), n = (r[0] - e[0]) / (r[1] - e[1]), i = (s * t[1] - t[0] - n * e[1] + e[0]) / (s - n), g = s * i - s * t[1] + t[0], [g, i]
};
PlotUtils.getAzimuth = function (t, o) {
    var e, r = Math.asin(Math.abs(o[1] - t[1]) / PlotUtils.distance(t, o));
    return o[1] >= t[1] && o[0] >= t[0] ? e = r + Math.PI : o[1] >= t[1] && o[0] < t[0] ? e = PlotUtils.TWO_PI - r : o[1] < t[1] && o[0] < t[0] ? e = r : o[1] < t[1] && o[0] >= t[0] && (e = Math.PI - r), e
};
PlotUtils.getAngleOfThreePoints = function (t, o, e) {
    var r = PlotUtils.getAzimuth(o, t) - PlotUtils.getAzimuth(o, e);
    return 0 > r ? r + PlotUtils.TWO_PI : r
};
PlotUtils.isClockWise = function (t, o, e) {
    return (e[1] - t[1]) * (o[0] - t[0]) > (o[1] - t[1]) * (e[0] - t[0])
};
PlotUtils.getPointOnLine = function (t, o, e) {
    var r = o[0] + t * (e[0] - o[0]),
        n = o[1] + t * (e[1] - o[1]);
    return [r, n]
};
PlotUtils.getCubicValue = function (t, o, e, r, n) {
    t = Math.max(Math.min(t, 1), 0);
    var g = 1 - t,
        i = t * t,
        s = i * t,
        a = g * g,
        l = a * g,
        u = l * o[0] + 3 * a * t * e[0] + 3 * g * i * r[0] + s * n[0],
        c = l * o[1] + 3 * a * t * e[1] + 3 * g * i * r[1] + s * n[1];
    return [u, c]
};
PlotUtils.getThirdPoint = function (t, o, e, r, n) {
    var g = PlotUtils.getAzimuth(t, o),
        i = n ? g + e : g - e,
        s = r * Math.cos(i),
        a = r * Math.sin(i);
    return [o[0] + s, o[1] + a]
};
PlotUtils.getArcPoints = function (t, o, e, r) {
    var n, g, i = [],
        s = r - e;
    s = 0 > s ? s + PlotUtils.TWO_PI : s;
    for (var a = 0; a <= PlotUtils.FITTING_COUNT; a++) {
        var l = e + s * a / PlotUtils.FITTING_COUNT;
        n = t[0] + o * Math.cos(l), g = t[1] + o * Math.sin(l), i.push([n, g])
    }
    return i
};
PlotUtils.getBisectorNormals = function (t, o, e, r) {
    var n = PlotUtils.getNormal(o, e, r),
        g = Math.sqrt(n[0] * n[0] + n[1] * n[1]),
        i = n[0] / g,
        s = n[1] / g,
        a = PlotUtils.distance(o, e),
        l = PlotUtils.distance(e, r);
    if (g > PlotUtils.ZERO_TOLERANCE) if (PlotUtils.isClockWise(o, e, r)) {
        var u = t * a,
            c = e[0] - u * s,
            p = e[1] + u * i,
            h = [c, p];
        u = t * l, c = e[0] + u * s, p = e[1] - u * i;
        var d = [c, p]
    } else u = t * a, c = e[0] + u * s, p = e[1] - u * i, h = [c, p], u = t * l, c = e[0] - u * s, p = e[1] + u * i, d = [c, p];
    else c = e[0] + t * (o[0] - e[0]), p = e[1] + t * (o[1] - e[1]), h = [c, p], c = e[0] + t * (r[0] - e[0]), p = e[1] + t * (r[1] - e[1]), d = [c, p];
    return [h, d]
};
PlotUtils.getNormal = function (t, o, e) {
    var r = t[0] - o[0],
        n = t[1] - o[1],
        g = Math.sqrt(r * r + n * n);
    r /= g, n /= g;
    var i = e[0] - o[0],
        s = e[1] - o[1],
        a = Math.sqrt(i * i + s * s);
    i /= a, s /= a;
    var l = r + i,
        u = n + s;
    return [l, u]
};
PlotUtils.getCurvePoints = function (t, o) {
    for (var e = PlotUtils.getLeftMostControlPoint(o), r = [e], n = 0; n < o.length - 2; n++) {
        var g = o[n],
            i = o[n + 1],
            s = o[n + 2],
            a = PlotUtils.getBisectorNormals(t, g, i, s);
        r = r.concat(a)
    }
    var l = PlotUtils.getRightMostControlPoint(o);
    r.push(l);
    var u = [];
    for (n = 0; n < o.length - 1; n++) {
        g = o[n], i = o[n + 1], u.push(g);
        for (var t = 0; t < PlotUtils.FITTING_COUNT; t++) {
            var c = PlotUtils.getCubicValue(t / PlotUtils.FITTING_COUNT, g, r[2 * n], r[2 * n + 1], i);
            u.push(c)
        }
        u.push(i)
    }
    return u
};
PlotUtils.getLeftMostControlPoint = function (o) {
    var e = o[0],
        r = o[1],
        n = o[2],
        g = PlotUtils.getBisectorNormals(0, e, r, n),
        i = g[0],
        s = PlotUtils.getNormal(e, r, n),
        a = Math.sqrt(s[0] * s[0] + s[1] * s[1]);
    if (a > PlotUtils.ZERO_TOLERANCE) var l = PlotUtils.mid(e, r),
        u = e[0] - l[0],
        c = e[1] - l[1],
        p = PlotUtils.distance(e, r),
        h = 2 / p,
        d = -h * c,
        f = h * u,
        E = d * d - f * f,
        v = 2 * d * f,
        A = f * f - d * d,
        _ = i[0] - l[0],
        y = i[1] - l[1],
        m = l[0] + E * _ + v * y,
        O = l[1] + v * _ + A * y;
    else m = e[0] + t * (r[0] - e[0]), O = e[1] + t * (r[1] - e[1]);
    return [m, O]
};
PlotUtils.getRightMostControlPoint = function (o) {
    var e = o.length,
        r = o[e - 3],
        n = o[e - 2],
        g = o[e - 1],
        i = PlotUtils.getBisectorNormals(0, r, n, g),
        s = i[1],
        a = PlotUtils.getNormal(r, n, g),
        l = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    if (l > PlotUtils.ZERO_TOLERANCE) var u = PlotUtils.mid(n, g),
        c = g[0] - u[0],
        p = g[1] - u[1],
        h = PlotUtils.distance(n, g),
        d = 2 / h,
        f = -d * p,
        E = d * c,
        v = f * f - E * E,
        A = 2 * f * E,
        _ = E * E - f * f,
        y = s[0] - u[0],
        m = s[1] - u[1],
        O = u[0] + v * y + A * m,
        T = u[1] + A * y + _ * m;
    else O = g[0] + t * (n[0] - g[0]), T = g[1] + t * (n[1] - g[1]);
    return [O, T]
};
PlotUtils.getBezierPoints = function (t) {
    if (t.length <= 2) return t;
    for (var o = [], e = t.length - 1, r = 0; 1 >= r; r += .01) {
        for (var n = 0, y = 0, g = 0; e >= g; g++) {
            var i = PlotUtils.getBinomialFactor(e, g),
                s = Math.pow(r, g),
                a = Math.pow(1 - r, e - g);
            n += i * s * a * t[g][0], y += i * s * a * t[g][1]
        }
        o.push([n, y])
    }
    return o.push(t[e]), o
};
PlotUtils.getBinomialFactor = function (t, o) {
    return PlotUtils.getFactorial(t) / (PlotUtils.getFactorial(o) * PlotUtils.getFactorial(t - o))
};
PlotUtils.getFactorial = function (t) {
    if (1 >= t) return 1;
    if (2 == t) return 2;
    if (3 == t) return 6;
    if (4 == t) return 24;
    if (5 == t) return 120;
    for (var o = 1, e = 1; t >= e; e++) o *= e;
    return o
};
PlotUtils.getQBSplinePoints = function (t) {
    if (t.length <= 2) return t;
    var o = 2,
        e = [],
        r = t.length - o - 1;
    e.push(t[0]);
    for (var n = 0; r >= n; n++) for (var g = 0; 1 >= g; g += .05) {
        for (var i = 0, y = 0, s = 0; o >= s; s++) {
            var a = PlotUtils.getQuadricBSplineFactor(s, g);
            i += a * t[n + s][0], y += a * t[n + s][1]
        }
        e.push([i, y])
    }
    return e.push(t[t.length - 1]), e
};
PlotUtils.getQuadricBSplineFactor = function (t, o) {
    return 0 == t ? Math.pow(o - 1, 2) / 2 : 1 == t ? (-2 * Math.pow(o, 2) + 2 * o + 1) / 2 : 2 == t ? Math.pow(o, 2) / 2 : 0
};
PlotUtils.curveAlgorithm = function (arrays) {
    var array = [];
    for (var i = 0; i < arrays.length; i++) {
        var item = arrays[i];
        var obj = {
            x: item[0],
            y: item[1],
        }
        array.push(obj);
    }

    var n = array.length;
    var o = [];

    for (var a = 0; a < n - 1; a++)
        array[a].x === array[a + 1].x && array[a].y === array[a + 1].y || o.push(array[a]);
    o.push(array[n - 1]);
    var bzPoints = PlotUtils.bTypeline(o);
    var result = {
        point0: []
    };
    for (var i = 0; i <= bzPoints.length - 1; i++)
        result.point0.push(bzPoints[i]);

    return result;
};


/**
 * 计算向量与 X 轴正方向的顺时针角度（0~360°）
 * @param {number} dx - 向量 x 分量 (终点.x - 起点.x)
 * @param {number} dy - 向量 y 分量 (终点.y - 起点.y)
 * @returns {number} 角度（度），范围 0~360
 */
function angleClockwiseFromX(dx, dy) {
    // atan2 返回逆时针弧度，取负转为顺时针，再转角度并归一化
    let deg = -Math.atan2(dy, dx) * 180 / Math.PI;
    return (deg % 360 + 360) % 360;  // 确保在 0~360 范围
}

// 使用示例
// 使用示例：生成椭圆上的100个点
PlotUtils.generateEllipsePoints = function (coordinates) {
    var center = coordinates[0];
    var point = coordinates[1];


    var xSemiAxis = Math.abs(center[0]-point[0]);
    var ySemiAxis = Math.abs(center[1]-point[1]);
    if(xSemiAxis==0||ySemiAxis==0){
        return null;
    }
    var angle=0;
    angle=  angleClockwiseFromX(point[0]-center[0],point[1]-center[1]);
    var ellipse = turf.ellipse(center, xSemiAxis, ySemiAxis,{
        units: "degrees",
        angle: angle
    });
    return ellipse;
}


export default PlotUtils;
