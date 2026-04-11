var LFVector = L.FeatureGroup.extend({

    constructor(opt_options) {
        this._layers = {};
    },
    addFeature(object) {
        /* var object = {
             type: 'Feature',
             geometry: {
                 coordinates: [],
                 type: ''//'Point MultiPoint''LineString MultiLineString Polygon MultiPolygon'
             },
             geometry_name: '',
             properties: {}
         };*/
        var layer = geometryToLayer(object);
        layer.feature = asFeature(object);
        return this.addLayer(layer);
    },
    // @method resetStyle( <Path> layer? ): this
    // Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
    // If `layer` is omitted, the style of all features in the current layer is reset.
    resetStyle: function (layer) {
        if (layer === undefined) {
            return this.eachLayer(this.resetStyle, this);
        }
        // reset any custom styles
        layer.options = L.Util.extend({}, layer.defaultOptions);
        this._setLayerStyle(layer, this.options.style);
        return this;
    },
    // @method setStyle( <Function> style ): this
    // Changes styles of GeoJSON vector layers with the given style function.
    setStyle: function (style) {
        return this.eachLayer(function (layer) {

            this._setLayerStyle(layer, style);
        }, this);
    },
    _setLayerStyle: function (layer, style) {
        if (layer.setStyle) {
            if (typeof style === 'function') {
                style = style(layer.feature);
            }
            layer.setStyle(style);
        }
    }

});

function _pointToLayer(latlng) {
    //var style = featureStyle["Point"];

    //return new L.circle(latlng, style);
    return new L.circle(latlng);
}

function geometryToLayer(geojson) {
    var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
        coords = geometry ? geometry.coordinates : null,
        latlng, latlngs, i, len;

    if (!coords && !geometry) {
        return null;
    }
    switch (geometry.type) {
        case 'Point':
            latlng = coordsToLatLng(coords);
            return _pointToLayer(latlng);
        case 'MultiPoint':
            /*var layers = [];
            for (i = 0, len = coords.length; i < len; i++) {
                latlng = coordsToLatLng(coords[i]);
                layers.push(_pointToLayer(pointToLayer, geojson, latlng, options));
            }
            return new L.FeatureGroup(layers);*/
            break;
        case 'LineString':
        case 'MultiLineString':
            latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLngs);
            return new L.Polyline(latlngs);
        case 'Polygon':
        case 'MultiPolygon':
            latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
            return new L.Polygon(latlngs);
        default:
            throw new Error('Invalid GeoJSON object.');
    }
}

function coordsToLatLng(coords) {
    return new L.LatLng(coords[1], coords[0], coords[2]);
}

function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
    var latlngs = [];

    for (var i = 0, len = coords.length, latlng; i < len; i++) {
        latlng = levelsDeep ?
            coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
            (_coordsToLatLng || coordsToLatLng)(coords[i]);

        latlngs.push(latlng);
    }

    return latlngs;
}

function asFeature(geojson) {
    if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
        return geojson;
    }

    return {
        type: 'Feature',
        properties: {},
        geometry: geojson
    };
}

export default LFVector;
