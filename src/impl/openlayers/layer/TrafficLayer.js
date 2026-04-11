class TrafficLayer {
    constructor(map, object) {
        this.map = map;
        this.obj = {};
        this.obj.projzh = createProjzh();

        this.clientId = this.obj.clientId;
        this.clientSecret = this.obj.clientSecret;
        this.obj.restHttp = null;

        this.obj.url = object.url;
        this.source = createSource(this.obj);

        this.layer = new ol.layer.Tile({
            source: this.source
        });
        this.map.addLayer(this.layer);
    }

    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    setVisible(visible) {
        this.layer.setVisible(visible);
    };

    getVisible() {
        return this.layer.getVisible();
    };

    /**
     * 移除地图
     */
    removeLayer() {
        if (this.layer) {
            this.map.removeLayer(this.layer)
        }
    }

    /**
     * 重新添加地图
     */
    addLayer() {
        if (this.layer) {
            this.map.addLayer(this.layer);
        }
    };

    setClickCallback(fun) {
        /*if (this._removefun) {
            this._removefun();
            this._removefun = null;
            this._clickCallback = null;
        }
        if (fun) {
            this._removefun = this.map._event.addEventListener(fun, this);
            this._clickCallback = fun;
        }*/
    }  setMoveCallback(fun) {
        /*if (this._removefun) {
            this._removefun();
            this._removefun = null;
            this._clickCallback = null;
        }
        if (fun) {
            this._removefun = this.map._event.addEventListener(fun, this);
            this._clickCallback = fun;
        }*/
    }

    contains(feature) {
        return false;
    }
    /**
     * 0 移动到最底层
     * 1 上移一层
     * 2 移动到最顶层
     * -1 下移一层
     * @param index
     */
    setZIndex(index) {
        var z = this.layer.getZIndex();
        switch (index) {
            case 0:
                this.layer.setZIndex(0);
                break;
            case 2:
                z = this.map.getLayers().getLength();
                this.layer.setZIndex(z - 1);
                break;
            case -1:
                z = z - 1;
                if (z <= 0) {
                    z = 0;
                }
                this.layer.setZIndex(z);
                break;
            default:
                this.layer.setZIndex(z + 1);


                break;

        }
    }

}

function createProjzh() {
    var t = {};
    var p = {
        forEachPoint: function (s) {
            return function (t, e, n) {
                var i;
                var r = t.length;
                var o = n || 2;
                i = e || (2 !== o ? t.slice() : new Array(r));
                for (var a = 0; a < r; a += o) {
                    s(t, i, a)
                }
                return i;
            }
        },
        convertor: function (t, e, n, i) {
            var r = t[n];
            var o = t[n + 1];
            var a = i[0] + i[1] * Math.abs(r);
            var s = Math.abs(o) / i[9];
            var l = i[2] + i[3] * s + i[4] * s * s + i[5] * s * s * s + i[6] * s * s * s * s + i[7] * s * s * s * s * s + i[8] * s * s * s * s * s * s;
            e[n] = a * (r < 0 ? -1 : 1), e[n + 1] = l * (o < 0 ? -1 : 1)
        },
        delta: function (t, e) {
            var n;
            var i;
            var r;
            var o;
            var a;
            var s;
            var l = .006693421622965943;
            var u = (r = 2 * (n = t - 105) - 100 + 3 * (i = e - 35) + .2 * i * i + .1 * n * i + .2 * Math.sqrt(Math.abs(n)),
                r += 2 * (20 * Math.sin(6 * n * Math.PI) + 20 * Math.sin(2 * n * Math.PI)) / 3,
                r += 2 * (20 * Math.sin(i * Math.PI) + 40 * Math.sin(i / 3 * Math.PI)) / 3,
                r += 2 * (160 * Math.sin(i / 12 * Math.PI) + 320 * Math.sin(i * Math.PI / 30)) / 3);
            var h = (s = 300 + (o = t - 105) + 2 * (a = e - 35) + .1 * o * o + .1 * o * a + .1 * Math.sqrt(Math.abs(o)),
                s += 2 * (20 * Math.sin(6 * o * Math.PI) + 20 * Math.sin(2 * o * Math.PI)) / 3,
                s += 2 * (20 * Math.sin(o * Math.PI) + 40 * Math.sin(o / 3 * Math.PI)) / 3,
                s += 2 * (150 * Math.sin(o / 12 * Math.PI) + 300 * Math.sin(o / 30 * Math.PI)) / 3);
            var c = e / 180 * Math.PI, p = Math.sin(c);
            p = 1 - l * p * p;
            var f = Math.sqrt(p);
            return u = 180 * u / (6378245 * (1 - l) / (p * f) * Math.PI), [h = 180 * h / (6378245 / f * Math.cos(c) * Math.PI), u]
        },
        outOfChina: function (t, e) {
            return t < 72.004 || 137.8347 < t || (e < .8293 || 55.8271 < e)
        }
    };
    var o = {RADIUS: 6378137, MAX_LATITUDE: 85.0511287798, RAD_PER_DEG: Math.PI / 180};
    o.forward = p.forEachPoint(function (t, e, n) {
        var i = Math.max(Math.min(o.MAX_LATITUDE, t[n + 1]), -o.MAX_LATITUDE),
            r = Math.sin(i * o.RAD_PER_DEG);
        e[n] = o.RADIUS * t[n] * o.RAD_PER_DEG, e[n + 1] = o.RADIUS * Math.log((1 + r) / (1 - r)) / 2
    });
    o.inverse = p.forEachPoint(function (t, e, n) {
        e[n] = t[n] / o.RADIUS / o.RAD_PER_DEG, e[n + 1] = (2 * Math.atan(Math.exp(t[n + 1] / o.RADIUS)) - Math.PI / 2) / o.RAD_PER_DEG
    });
    var a = {};
    a.toWGS84 = p.forEachPoint(function (t, e, n) {
        var i = t[n], r = t[n + 1];
        if (!p.outOfChina(i, r)) {
            var o = p.delta(i, r);
            i -= o[0], r -= o[1]
        }
        e[n] = i, e[n + 1] = r
    });
    a.fromWGS84 = p.forEachPoint(function (t, e, n) {
        var i = t[n], r = t[n + 1];
        if (!p.outOfChina(i, r)) {
            var o = p.delta(i, r);
            i += o[0], r += o[1]
        }
        e[n] = i, e[n + 1] = r
    });
    var r = {};
    r.forward = p.forEachPoint(function (t, e, n) {
        var i, r, o, a, s = function (t, e, n) {
                var i = n - e;
                for (; n < t;) t -= i;
                for (; t < e;) t += i;
                return t
            }(t[n], -180, 180), l = (i = t[n + 1], r = -74, o = 74, i = Math.max(i, r), i = Math.min(i, o)),
            u = [[-.0015702102444, 111320.7020616939, 0x60e374c3105a3, -0x24bb4115e2e164, 0x5cc55543bb0ae8, -0x7ce070193f3784, 0x5e7ca61ddf8150, -0x261a578d8b24d0, 0x665d60f3742ca, 82.5], [.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5], [.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5], [.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5], [-.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5], [-.0003218135878613132, 111320.7020701615, .00369383431289, 823725.6402795718, .46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, .37238884252424, 7.45]],
            h = [75, 60, 45, 30, 15, 0], c = null;
        for (a = 0; a < h.length; ++a) if (h[a] <= l) {
            c = u[a];
            break
        }
        if (null === c) for (a = h.length - 1; 0 <= a; --a) if (l <= -h[a]) {
            c = u[a];
            break
        }
        e[n] = s, e[n + 1] = l, p.convertor(e, e, n, c)
    });
    r.inverse = p.forEachPoint(function (t, e, n) {
        for (var i = Math.abs(t[n + 1]), r = [[1.410526172116255e-8, 898305509648872e-20, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -.03801003308653, 17337981.2], [-7.435856389565537e-9, 8983055097726239e-21, -.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86], [-3.030883460898826e-8, 898305509983578e-20, .30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, .32710905363475, 6856817.37], [-1.981981304930552e-8, 8983055099779535e-21, .03278182852591, 40.31678527705744, .65659298677277, -4.44255534477492, .85341911805263, .12923347998204, -.04625736007561, 4482777.06], [3.09191371068437e-9, 8983055096812155e-21, 6995724062e-14, 23.10934304144901, -.00023663490511, -.6321817810242, -.00663494467273, .03430082397953, -.00466043876332, 2555164.4], [2.890871144776878e-9, 8983055095805407e-21, -3.068298e-8, 7.47137025468032, -353937994e-14, -.02145144861037, -1234426596e-14, .00010322952773, -323890364e-14, 826088.5]], o = null, a = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0], s = 0; s < a.length; s++) if (a[s] <= i) {
            o = r[s];
            break
        }
        p.convertor(t, e, n, o)
    });
    var s = {};
    s.toWGS84 = function (t, e, n) {
        var s = 3e3 * Math.PI / 180;
        var i = p.forEachPoint(function (t, e, n) {
            var i = t[n] - .0065, r = t[n + 1] - .006,
                o = Math.sqrt(i * i + r * r) - 2e-5 * Math.sin(r * s),
                a = Math.atan2(r, i) - 3e-6 * Math.cos(i * s);
            return e[n] = o * Math.cos(a), e[n + 1] = o * Math.sin(a), e
        })(t, e, n);
        return a.toWGS84(i, i, n)
    };
    s.fromWGS84 = function (t, e, n) {
        var s = 3e3 * Math.PI / 180, i = a.fromWGS84(t, e, n);
        return p.forEachPoint(function (t, e, n) {
            var i = t[n], r = t[n + 1], o = Math.sqrt(i * i + r * r) + 2e-5 * Math.sin(r * s),
                a = Math.atan2(r, i) + 3e-6 * Math.cos(i * s);
            return e[n] = o * Math.cos(a) + .0065, e[n + 1] = o * Math.sin(a) + .006, e
        })(i, i, n)
    };
    t.smerc2bmerc = function (t, e, n) {
        var i = o.inverse(t, e, n);
        return i = s.fromWGS84(i, i, n), r.forward(i, i, n)
    };
    t.bmerc2smerc = function (t, e, n) {
        var i = r.inverse(t, e, n);
        return i = s.toWGS84(i, i, n), o.forward(i, i, n)
    };
    t.bmerc2ll = function (t, e, n) {
        var i = r.inverse(t, e, n);
        return s.toWGS84(i, i, n)
    };
    t.ll2bmerc = function (t, e, n) {
        var i = s.fromWGS84(t, e, n);
        return r.forward(i, i, n)
    };
    t.ll2smerc = o.forward;
    t.smerc2ll = o.inverse;
    var e = new ol.proj.Projection({
        code: "baidu",
        extent: ol.extent.applyTransform([72.004, .8293, 137.8347, 55.8271], t.ll2bmerc),
        units: "m"
    });
    ol.proj.addProjection(e);
    //.proj.addCoordinateTransforms("EPSG:4490", e, t.ll2bmerc, t.bmerc2ll);
    ol.proj.addCoordinateTransforms("EPSG:4326", e, t.ll2bmerc, t.bmerc2ll);
    ol.proj.addCoordinateTransforms("EPSG:3857", e, t.smerc2bmerc, t.bmerc2smerc);
    return t;

}

function createSource(object) {
    var t = object.extent || [72.004, .8293, 137.8347, 55.8271];
    if (!object.resolutions) {
        for (var e = new Array(19), n = 0; n < 19; ++n) {
            e[n] = Math.pow(2, 18 - n);
        }
        object.resolutions = e
    }
    object.origin = object.origin || [0, 0];
    object.extent = ol.extent.applyTransform(t, object.projzh.ll2bmerc);
    var i = object.tileSize || [256, 256];
    var r = void 0 === object.crossOrigin ? "anonymous" : object.crossOrigin;
    var a = object.scaler ? object.scaler : 1;
    return new ol.source.XYZ({
        //url: object.url,
        wrapX: void 0 !== object.wrapX && object.wrapX,
        crossOrigin: r,
        tileSize: i,
        projection: "baidu",
        tileGrid: new ol.tilegrid.TileGrid({
            origin: object.origin,
            resolutions: object.resolutions,
            tileSize: i,
            extent: object.extent
        }),
        tileUrlFunction: function (t) {
            var e = t[1];
            var n = -t[2] - 1;
            var i = t[0];
            var r = (new Date).getTime();
            var url = object.url + "?time=" + r + "&level=" + i + "&x=" + e + "&y=" + n + "&scaler=" + a
            return url;
        },
        tileLoadFunction: function (imageTile, src) {
            //imageTile.getImage().src = "http://19.15.70.147:18091/maps-webapp/geography/egis/wrts?time=1622795717352&level=9&x=99&y=20&scaler=1";
            imageTile.getImage().src = src;
            /* !function (t, i, e) {
                if(t){
                    t._token ? t.get(e, "arraybuffer", void 0, void 0).then(function (t) {
                        var e = new Uint8Array(t), n = "data:image/png;base64," + s.decode(e);
                        i.src = n
                    }) : i.src = e
                }

            }(object.restHttp, t.getImage(), e)*/

        }
    })
}

export default TrafficLayer;
