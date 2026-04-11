import LFVector from "./LFVector";

const Mode = {
    POINT: 'Point',
    LINE_STRING: 'LineString',
    POLYGON: 'Polygon',
    CIRCLE: 'Circle',
};

function LFDraw(map) {


    var vectorSource = new LFVector();

    vectorSource.addTo(map);
    //vectorSource.addFeature(data)
    this.mode_ = null;//绘图类型

    this.feature = null;
    this.featureing = null;
    this.circleing = 0;

    var that = this;
    var _captureMarker = null;

    var coord = [];
    var tempCoord = [];

    var startPoint = [];
    var circleCoordinates = [];

    //绘制点
    function drawPoint(e) {

        var data = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    e.lng,
                    e.lat
                ]
            },
            "geometry_name": "geom",
        };
        this.feature = vectorSource.addFeature(data);
        startPoint = [];
        coord = [];
    }

    //绘制线
    function drawLine(e) {
        if (coord.length > 1) {
            coord.pop();
            var data = {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [coord]
                },
                "geometry_name": "geom",
            };
            that.feature = vectorSource.addFeature(data);
            if (that.featureing) {
                map.removeLayer(that.featureing);
                that.featureing = null;
            }
        }


    }

    //绘制面
    function drawPolygon(e) {
        if (coord.length > 1) {
            coord.pop();
            var data = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coord]
                },
                "geometry_name": "geom",
            };
            that.feature = vectorSource.addFeature(data);
            if (that.featureing) {
                map.removeLayer(that.featureing);
                that.featureing = null;
            }
        }


    }

    //圆
    function drawCircle(e) {
        if (coord.length > 1) {
            coord.pop();
            var data = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [circleCoordinates]
                },
                "geometry_name": "geom",
            };
            that.feature = vectorSource.addFeature(data);
            if (that.featureing) {
                map.removeLayer(that.featureing);
                that.featureing = null;
            }
        }


    }


    function tempFeature(e) {
        tempCoord.push([e.latlng.lat, e.latlng.lng]);
        switch (that.mode_) {
            case Mode.POINT:
                break;
            case Mode.LINE_STRING:
                if (tempCoord.length > 1) {
                    if (!that.featureing) {
                        that.featureing = new L.polyline([tempCoord]).addTo(map);
                    }
                    that.featureing.setLatLngs([tempCoord]);
                }
                break;
            case Mode.POLYGON:
                if (tempCoord.length > 1) {
                    if (!that.featureing) {
                        that.featureing = new L.Polygon([tempCoord]).addTo(map);
                    }
                    that.featureing.setLatLngs([tempCoord]);
                }
                break;
            case Mode.CIRCLE:
                if (tempCoord.length > 1) {

                    var item = createRegularPolygon(startPoint, [e.latlng.lat, e.latlng.lng]);
                    if (!that.featureing) {

                        that.featureing = new L.Polygon(item).addTo(map);
                    }
                    that.featureing.setLatLngs(item);
                }
                break;

        }
        tempCoord.pop();
    }

    function onClick(e) {
        startPoint[0] = e.latlng.lat;
        startPoint[1] = e.latlng.lng;
        coord.push([e.latlng.lng, e.latlng.lat]);
        tempCoord.push([e.latlng.lat, e.latlng.lng]);
        if (!_captureMarker) {
            _captureMarker = L.marker(map.getCenter(), {
                clickable: true,
                opacity: 0
            }).addTo(map);
        }
        _captureMarker.setIcon(
            L.divIcon({
                iconSize: map.getSize().multiplyBy(2)
            })
        );
        switch (that.mode_) {
            case Mode.POINT:
                //coord.push([e.latlng.lat, e.latlng.lng]);
                drawPoint(e.latlng);
                break;
            case Mode.LINE_STRING:

                break;
            case Mode.POLYGON:
                break;
            case Mode.CIRCLE:
                that.circleing++;
                if (that.circleing === 2) {
                    finishFun();
                    that.circleing = 0;
                }
                break;

        }

    }

    function onMove(e) {
        tempFeature(e);

    }

    function onDoubleClick(e) {
        finishFun();
    }

    function mouseHandle(bl) {
        if (bl) {
            map.on('click', onClick);    //点击地图
            map.on('dblclick', onDoubleClick);
            map.on('mousemove', onMove);//双击地图
        } else {
            map.off('mousemove', onClick, this)
                .off('dblclick', onDoubleClick, this)
                .off('click', onClick, this)
        }

    }

    function finishFun() {
        if (_captureMarker) {
            map.removeLayer(_captureMarker);
        }
        switch (that.mode_) {
            case Mode.POINT:
                break;
            case Mode.LINE_STRING:
                drawLine();
                break;
            case Mode.POLYGON:
                drawPolygon();
                break;
            case Mode.CIRCLE:
                drawCircle();
                break;

        }
        _captureMarker = null;
        startPoint = [];
        coord = [];
        tempCoord = [];

    }

    function startFun() {
        mouseHandle(true);
    }

    this.drawGraphic = function (object) {
        let type = object.type;
        finishFun();
        let value = null;
        switch (type) {
            case 'Circle':
                value = 'Circle';
                break;
            case 'RadiusCircle':
                value = 'Point';
                break;
            case 'Point':
                value = "Point";
                break;
            case 'LineString':
                value = "LineString";
                break;
            case 'Polygon':
                value = "Polygon";
                break;
            case 'Box':
                value = 'Circle';
                //geometryFunction = new ol.interaction.Draw.createBox();
                break;
            case 'Square':
                value = 'Circle';
                //geometryFunction = new ol.interaction.Draw.createRegularPolygon(4);
                break;
            default:
                value = 'Point';
                break;
        }
        if (value) {
            this.mode_ = value;
            startFun();
        } else {

        }


    };

    function squaredDistance(coord1, coord2) {
        const dx = coord1[0] - coord2[0];
        const dy = coord1[1] - coord2[1];
        return dx * dx + dy * dy;
    }

    function createRegularPolygon(center, end) {
        var radius = Math.sqrt(squaredDistance(center, end));
        const flatCoordinates = [];
        circleCoordinates = [];
        const sides = 32;
        const startAngle = 0;
        for (let i = 0; i < sides; ++i) {
            const angle = startAngle + (modulo(i, sides) * 2 * Math.PI) / sides;
            var lat = center[0] + radius * Math.cos(angle);
            var lng = center[1] + radius * Math.sin(angle);
            flatCoordinates.push([lat, lng]);
            circleCoordinates.push([lng, lat]);
        }
        return flatCoordinates;

    }

    function modulo(a, b) {
        const r = a % b;
        return r * b < 0 ? r + b : r;
    }


}

export default LFDraw;