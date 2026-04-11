import {hasUndefined} from "../../../common/util";

/**
 * 图片图层
 * @param map
 * @constructor
 */
class ImageLayer {
    constructor(map, object) {

        if (hasUndefined(map)) {
            return;
        }
        this.map = map;
        this.image = new ol.layer.Image();
        this.imageStatic = null;
        this.imagestatics = [];
        this.map.addLayer(this.image);
        this._interval = null;
        this._time = 500;
        let cbfun = null;

        this.addimage = function (object) {
            this.addLayer();
            var length = object.image.length;
            var imageExtent = object.coordinate
            for (var i = 0; i < length; i++) {
                var item = object.image[i]
                this.imagestatics.push(new ol.source.ImageStatic({
                    url: item,
                    imageExtent: imageExtent,
                }));
            }
        }
        this.start = function () {
            this.stop();
            if (this._image != null) {
                var i = 0;
                var length = this.imagestatics.length;
                let that = this;
                this._interval = setInterval(function () {
                    if (i >= length) {
                        i = 0;
                    }
                    that.setIndex(i++);
                    if (cbfun != null) {
                        cbfun((i - 1));
                    }
                }, this._time);
            }
        };
        this.stop = function () {
            if (this._interval != null) {
                clearInterval(this._interval);
                this._interval = null;
            }
        };
        /**
         * 根据索引设置显示那张图片
         * @param index
         */
        this.setIndex = function (index) {
            if (index >= 0 && this.imagestatics.length > index) {
                this.image.setSource(this.imagestatics[index]);
            }
        }

        this.addfeature = function (object) {

            this.img = object;
            if (object && object.coordinate) {
                var imageExtent = object.coordinate
                this.addimage(object)
            }
            this._image = object.image;

        };
    }


    /**
     * 设置图片
     * @param object {url'',coordinate[1,1,1,1]}
     */

    setImageStatic(object) {
        if (object) {
            if (this.imageStatic) {
                if (this.image.getVisible()) {
                    this.imageStatic = new ol.source.ImageStatic({
                        url: object.url,
                        imageExtent: object.coordinate,
                    });
                    this.image.setSource(this.imageStatic);
                }
            } else {
                this.imageStatic = new ol.source.ImageStatic({
                    url: object.url,
                    imageExtent: object.coordinate,
                });
                this.image.setSource(this.imageStatic);
            }
        }

    };


    /**
     * 移除图层
     */

    removeLayer() {
        this.map.removeLayer(this.image);
    };

    /**
     * 添加到地图中
     */

    addLayer() {
        if (this.image) {
            this.map.removeLayer(this.image);
            this.map.addLayer(this.image);
        }
    };

    clear() {
        this.removeLayer();
        this.imagestatics = [];
    }

    /**
     * 设置图层的可见性
     * @param object {visible:true/false}
     */

    setVisible(object) {
        this.image.setVisible(object);
    };

    getVisible(object) {
        this.image.getVisible();
    };

    setClickCallback(fun) {

    }

    setMoveCallback(fun) {

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
        var z = this.image.getZIndex();
        switch (index) {
            case 0:
                this.image.setZIndex(0);
                break;
            case 2:
                z = this.map.getLayers().getLength();
                this.image.setZIndex(z - 1);
                break;
            case -1:
                z = z - 1;
                if (z <= 0) {
                    z = 0;
                }
                this.image.setZIndex(z);
                break;
            default:

                this.image.setZIndex(z + 1);

                break;

        }
    }
    setStyle=function () {

    }

}

export default ImageLayer;
