import '../../../assets/css/PointBillboard.css'

function PointBillboardLayer(map, options) {
    this.map = map;
    this.view = this.map.getView();
    this._height = 15000000;
    this.entityCollection = {};
    this.scale = 0;
    var that = this;
    let cbfun = null;
    let callbackfun = function (id) {
        if (cbfun) {
            if (that.entityCollection[id]) {
                var item = that.entityCollection[id];
                var strx = item.div.element.style.left;
                var stry = item.div.element.style.top;
                var x = parseFloat(strx.substr(0, strx.length - 2));
                var y = parseFloat(stry.substr(0, stry.length - 2));
                let object = {
                    coordinate: item.coordinate,
                    features: item.properties,
                    screen: [x, y],
                    id: id
                };
                cbfun(object);
            }

        }
    }

    let dpi = 25.4 / 0.84;

    this.view.on('change:center', function (e) {
        let resolution = e.target.get('resolution');
        let units = that.view.getProjection().getUnits();
        let mpu = ol.proj.Units.METERS_PER_UNIT[units];

        var scale = resolution * mpu * 39.37 * dpi;
        that.scale = scale;
        setshow(scale);
    })

    function setshow(scale) {
        if (scale > that._height) {

            for (var index in that.entityCollection) {
                var item = that.entityCollection[index];
                that.map.removeOverlay(item.div);
            }
        } else {
            for (var index in that.entityCollection) {
                var item = that.entityCollection[index];
                that.map.addOverlay(item.div);
            }
        }
    }

    function addContent(id, object) {
        var infowin = document.createElement('div');
        if (cbfun) {
            infowin.onclick = function () {
                callbackfun(id);
            };
        }
        infowin.className = 'hot-base';
        infowin.id = id;
        var hotspot = document.createElement('div');
        hotspot.className = 'hot-spot';
        infowin.append(hotspot)
        var content = document.createElement('div');
        content.className = 'hot-spot-board';
        hotspot.append(content);
        var base = document.createElement('div');
        base.className = 'hot-spot-line-medium hot-spot-line';
        hotspot.append(base);

        content.innerHTML = object;
        return infowin;
    }

    function addHtmlDiv(id, object) {
        var infowin = document.createElement('div');
        if (cbfun) {
            infowin.onclick = function () {
                callbackfun(id);
            };
        }
        infowin.className = 'hot-base';
        infowin.id = id;
        infowin.innerHTML = object;

        return infowin;

    }

    /**
     * 设置图层的可见性
     * @param visible true/false
     */
    this.setVisible = function (visible) {
        //this.vectorLayer.setVisible(visible);
    };
    this.getVisible = function () {
        return true | false;
    };
    this.addFeature = function (options) {
        var geometry = options.geometry ? options.geometry : {};
        if (geometry.coordinates) {
            if (options.properties) {
                if (options.properties.div || options.properties.content) {
                    var guid = options.properties.id ? options.properties.id : createGuid();
                    var infowin;
                    if (options.properties.div) {
                        infowin = addHtmlDiv(guid, options.properties.div);
                    } else if (options.properties.content) {
                        infowin = addContent(guid, options.properties.content);
                    }
                    if (!this.entityCollection [guid]) {
                        let _overlay = new ol.Overlay({
                            element: infowin,
                            autoPan: true,
                            autoPanAnimation: {
                                duration: 250,
                            },
                        });
                        that.map.addOverlay(_overlay);
                        var center = geometry.coordinates;
                        _overlay.setPosition(center);
                        this.entityCollection [guid] = {
                            position: center,
                            div: _overlay,
                            add: true,
                            properties: options.properties
                        };
                    }

                }

            }

        }
    }

    /**
     * 通过id删除
     * @param id
     */
    this.removeFeature = function (id) {
        if (this.entityCollection[id]) {
            this.map.removeOverlay(this.entityCollection[id].div);
            delete this.entityCollection[id];
        }


    }
    /**
     * 通过id获取要素
     * @param id
     * @returns {*}
     */
    this.getFeatureById = function (id) {

        return null
    }

    this.length = function () {
        var count = 0;
        for (var i in this.entityCollection) {
            count++;
        }
        return count;
    }
    /**
     * 清空所有
     */
    this.clear = function () {
        for (var index in this.entityCollection) {
            this.removeFeature(index);
        }

    }
    this.setClickCallback = function (fun) {
        cbfun = fun;
    }
    this.setZIndex = function (index) {
    }
}

Object.defineProperties(PointBillboardLayer.prototype, {
    height: {
        set(v) {
            this._height = v;
            if (this.scale > this._height) {
                for (var index in this.entityCollection) {
                    var item = this.entityCollection[index];
                    this.map.removeOverlay(item.div);
                }
            } else {
                for (var index in this.entityCollection) {
                    var item = this.entityCollection[index];
                    this.map.addOverlay(item.div);
                }
            }
        }

    }
})

function createGuid() {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export default PointBillboardLayer;






