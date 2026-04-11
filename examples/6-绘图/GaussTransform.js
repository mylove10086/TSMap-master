/**
 * 转换成广州2000坐标
 * @constructor
 */
function Transform() {
    var a = a || {};
    return a.CoordTransc = a.CoordTransc || {}, a.CoordTransc.GaussTransform = {
        ellip_CGCS200: {a: 6378137, b: 6356752.31414, f: 1 / 298.257222101},
        ProjectionPara: {CenterL: 113.2833333333, ZoneWide: 3, ZoneNo: 38},
        fourTransPra: {
            scale: .999997756396785,
            rotationAngle: .0044099861111111,
            DX: -199995.893159972,
            DY: -16.6491077492992
        },
        BL2XY: function (o, r, t, n) {
            t = t || a.CoordTransc.GaussTransform.ellip_CGCS200, n = n || a.CoordTransc.GaussTransform.ProjectionPara;
            var s = t.a ? t.a : 0, M = (t.b && t.b, t.f ? t.f : 0), h = n.ZoneWide ? n.ZoneWide : 3,
                e = n.ZoneNo ? n.ZoneNo : parseInt(r / h) + 1, p = n.CenterL ? n.CenterL : e * h - h / 2,
                i = Math.sqrt(2 * M - Math.pow(M, 2)), w = i / Math.sqrt(1 - i * i);
            o = a.CoordTransc.AngleTransform.Degree2Radian(o, !1), r = a.CoordTransc.AngleTransform.Degree2Radian(r, !1);
            var T = Math.pow(w, 2) * Math.pow(Math.cos(o), 2), c = Math.tan(o),
                f = Math.sqrt(1 - Math.pow(i * Math.sin(o), 2)), u = (Math.pow(i, 2), Math.pow(f, 3), s / f),
                d = r - a.CoordTransc.AngleTransform.Degree2Radian(p, !1), G = Math.pow(d, 2),
                C = s * (1 - Math.pow(i, 2)) * (1.00505250559297 * o - .00253155620900066 * Math.sin(2 * o) + 265690155540381e-20 * Math.sin(4 * o) - 3.47007559905787e-9 * Math.sin(6 * o) + 491654216666515e-26 * Math.sin(8 * o) - 726313725279022e-29 * Math.sin(10 * o) + 107400991193683e-31 * Math.sin(12 * o)),
                X = (C = C = s * (1 - Math.pow(i, 2)) * (1.00505250559297 * o - .00253155620900066 * Math.sin(2 * o) + 265690155540381e-20 * Math.sin(4 * o)), Math.pow(Math.cos(o), 2), Math.pow(T, 2), Math.pow(Math.cos(o), 2), Math.pow(c, 4), Math.pow(Math.cos(o), 4), Math.pow(G, 2));
            X = C + u * Math.sin(o) * Math.cos(o) * G * (.5 + (5 - c * c + 9 * T + 4 * Math.pow(T, 2)) * Math.pow(Math.cos(o), 2) * G / 24 + (61 - 58 * c * c + Math.pow(c, 4)) / 720 * Math.pow(Math.cos(o), 4) * Math.pow(G, 2));
            var Y = u * Math.cos(o) * d * (1 + (1 - c * c + T) * Math.pow(Math.cos(o), 2) * G / 6 + (5 - 18 * c * c + Math.pow(c, 4) + 14 * T - 58 * T * c * c) * Math.pow(Math.cos(o), 4) * Math.pow(G, 2) / 120);
            return {X: Y += 5e5, Y: X}
        },
        G2000BLtoGZ2000XYZ: function (o, r, t, n) {
            var s = a.CoordTransc.GaussTransform.BL2XY(o, r, t, n);
            return a.CoordTransc.GaussTransform.G2000XYtoGZ2000XYZ(s.X, s.Y, t, n)
        },
        G2000XYtoGZ2000XYZ: function (o, r, t, n) {
            var s = {X: o - 460020, Y: r - 2329620};
            return a.CoordTransc.GaussTransform.G2000XYtoGZ2000XYZTransformPoint(s)
        },
        G2000XYtoGZ2000XYZTransformPoint: function (o) {
            var r = o.Y, t = o.X, n = a.CoordTransc.GaussTransform.fourTransPra.scale,
                s = a.CoordTransc.GaussTransform.fourTransPra.rotationAngle * Math.PI / 180,
                M = a.CoordTransc.GaussTransform.fourTransPra.DX, h = a.CoordTransc.GaussTransform.fourTransPra.DY,
                e = n * Math.cos(s), p = n * Math.sin(s);
            return X = e * r - p * t + M, Y = e * t + p * r + h, {X: Y, Y: X + 2e5}
        },
        GZ2000XYtoG2000XYZTransformPoint: function (o, r) {
            var t = {X: o, Y: r}, n = t.X, s = t.Y - 2e5, M = a.CoordTransc.GaussTransform.fourTransPra.scale,
                h = a.CoordTransc.GaussTransform.fourTransPra.rotationAngle * Math.PI / 180,
                e = a.CoordTransc.GaussTransform.fourTransPra.DX, p = a.CoordTransc.GaussTransform.fourTransPra.DY,
                i = M * Math.cos(h), w = M * Math.sin(h);
            return o = (i * s + w * n - i * e - w * p) / (Math.pow(i, 2) + Math.pow(w, 2)), {
                X: r = (i * n - w * s + w * e - i * p) / (Math.pow(i, 2) + Math.pow(w, 2)),
                Y: o
            }
        },
        GZ2000XYtoG2000XYZ: function (o, r, t, n) {
            var s = a.CoordTransc.GaussTransform.GZ2000XYtoG2000XYZTransformPoint(o, r);
            return {X: s.X + 460020, Y: s.Y + 2329620}
        },
        GZ2000XYtoG2000BL: function (o, r, t, n) {
            var s = a.CoordTransc.GaussTransform.GZ2000XYtoG2000XYZ(o, r, t, n);
            return a.CoordTransc.GaussTransform.XY2BL(s.X, s.Y, t, n)
        },
        XY2BL: function (o, r, t, n) {
            for (var s = r, M = o, h = (t = t || a.CoordTransc.GaussTransform.ellip_CGCS200, n = n || a.CoordTransc.GaussTransform.ProjectionPara, t.a ? t.a : 0), e = (t.b && t.b, t.f ? t.f : 0), p = Math.sqrt(2 * e - Math.pow(e, 2)), i = p / Math.sqrt(1 - p * p), w = 1 + .75 * Math.pow(p, 2) + 45 / 64 * Math.pow(p, 4) + 175 / 256 * Math.pow(p, 6) + 11025 / 16384 * Math.pow(p, 8) + 43659 / 65536 * Math.pow(p, 10) + 693693 / 1048576 * Math.pow(p, 12), T = 3 / 8 * Math.pow(p, 2) + 15 / 32 * Math.pow(p, 4) + 525 / 1024 * Math.pow(p, 6) + 2205 / 4096 * Math.pow(p, 8) + 72765 / 131072 * Math.pow(p, 10) + 297297 / 524288 * Math.pow(p, 12), c = 15 / 256 * Math.pow(p, 4) + 105 / 1024 * Math.pow(p, 6) + 2205 / 16384 * Math.pow(p, 8) + 10395 / 65536 * Math.pow(p, 10) + 1486485 / 8388608 * Math.pow(p, 12), f = 35 / 3072 * Math.pow(p, 6) + 105 / 4096 * Math.pow(p, 8) + 10395 / 262144 * Math.pow(p, 10) + 55055 / 1048576 * Math.pow(p, 12), u = (Math.pow(p, 8), Math.pow(p, 10), Math.pow(p, 12), Math.pow(p, 10), Math.pow(p, 12), Math.pow(p, 12), h * (1 - Math.pow(p, 2)) * w * Math.PI / 180), d = h * (1 - Math.pow(p, 2)) * T, G = h * (1 - Math.pow(p, 2)) * c, C = h * (1 - Math.pow(p, 2)) * f, X = s / u, Y = 0; Y = X, X = X * Math.PI / 180, X = (s - (-d * Math.sin(2 * X) + G * Math.sin(4 * X) - C * Math.sin(6 * X))) / u, !(Math.abs(X - Y) < 1e-7);) ;
            X = X * Math.PI / 180;
            var m = Math.pow(i, 2) * Math.pow(Math.cos(X), 2), Z = Math.tan(X),
                g = Math.sqrt(1 - Math.pow(p * Math.sin(X), 2)), P = h * (1 - Math.pow(p, 2)) / Math.pow(g, 3),
                l = (M = M % 1e6 - 5e5) / (h / g), A = n.ZoneWide ? n.ZoneWide : 3,
                v = n.ZoneNo ? n.ZoneNo : parseInt(q / A) + 1, D = n.CenterL ? n.CenterL : v * A - A / 2,
                L = a.CoordTransc.AngleTransform.Degree2Radian(D, !1) + (l - (1 + 2 * Z * Z + m) * Math.pow(l, 3) / 6 + (5 + 28 * Z * Z + 24 * Math.pow(Z, 4) + 6 * m + 8 * m * Math.pow(Z, 2)) * Math.pow(l, 5) / 120) / Math.cos(X),
                q = Math.round(1e11 * a.CoordTransc.AngleTransform.Radian2Degree(L, !1)) / 1e11,
                I = X - Z / (2 * P) * M * l * (1 - (5 + 3 * Z * Z + m - 9 * m * Math.pow(Z, 2)) * Math.pow(l, 2) / 12 + (61 + 90 * Z * Z + 45 * Math.pow(Z, 4)) * Math.pow(l, 4) / 360);
            return {B: Math.round(1e11 * a.CoordTransc.AngleTransform.Radian2Degree(I, !1)) / 1e11, L: q}
        },
        gcj02toG2000: function (o, r) {
            var t, n, s, M, h, e = Math, p = Math.PI, i = a.CoordTransc.GaussTransform.ellip_CGCS200, w = i.a,
                T = 2 * i.f;
            return t = function (a, o) {
                let r;
                return r = 2 * a - 100 + 3 * o + .2 * o * o + .1 * a * o + .2 * Math.sqrt(Math.abs(a)), r += 2 * (20 * Math.sin(6 * a * p) + 20 * Math.sin(2 * a * p)) / 3, r += 2 * (20 * Math.sin(o * p) + 40 * Math.sin(o / 3 * p)) / 3, r += 2 * (160 * Math.sin(o / 12 * p) + 320 * Math.sin(o * p / 30)) / 3, r
            }(o - 105, r - 35), n = function (a, o) {
                let r;
                return r = 300 + a + 2 * o + .1 * a * a + .1 * a * o + .1 * e.sqrt(e.abs(a)), r += 2 * (20 * e.sin(6 * a * p) + 20 * e.sin(2 * a * p)) / 3, r += 2 * (20 * e.sin(a * p) + 40 * e.sin(a / 3 * p)) / 3, r += 2 * (150 * e.sin(a / 12 * p) + 300 * e.sin(a / 30 * p)) / 3, r
            }(o - 105, r - 35), s = r / 180 * p, t = 180 * t / (w * (1 - T) / ((M = 1 - T * (M = e.sin(s)) * M) * (h = e.sqrt(M))) * p), [2 * o - (o + (n = 180 * n / (w / h * e.cos(s) * p))), 2 * r - (r + t)]
        },
        bd09togcj02: function (a, o) {
            var r = 52.35987755982988, t = (a = +a) - .0065, n = (o = +o) - .006,
                s = Math.sqrt(t * t + n * n) - 2e-5 * Math.sin(n * r), M = Math.atan2(n, t) - 3e-6 * Math.cos(t * r);
            return [s * Math.cos(M), s * Math.sin(M)]
        }
    }, a.CoordTransc.AngleTransform = {
        Degree2Radian: function (a, o) {
            return o && (a = Ang60ToAng100(a)), a * Math.PI / 180
        }, Ang60ToAng100: function (a) {
            return Ang2Ms(a), Math.round()
        }, Radian2Degree: function (a, o) {
            var r;
            return r = 180 * a / Math.PI, 1 == o && (r = Ang100ToAng60(r)), r
        }
    }, a.CoordTransc
}

