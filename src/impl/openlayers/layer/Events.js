/**
 * 用于管理特定事件的订阅者的通用实用程序类。 此类通常在容器类内部实例化，并作为属性公开以供其他人订阅。
 */
function Events() {
    this._listeners = [];
    this._scopes = [];
    this._toRemove = [];
    this._insideRaiseEvent = false;

    //地图缩放解释是的回调

    this.addEventListener = function (listener, scope) {
        this._listeners.push(listener);
        this._scopes.push(scope);
        var event = this;
        return function () {
            event.removeEventListener(listener, scope);
        };
    }

    this.raiseEvent = function (feature, object, type) {
        //不记得为什么要用这个了
        switch (type) {
            case "click":
                for (i = 0; i < feature.length; i++) {
                    var item = feature[i];
                    if (item._layer) {
                        if (item._layer._clickCallback) {
                            let ob = {
                                coordinate: object.coordinate,
                                features: [object.features[i]],
                                screen: object.screen,
                                zoom: object.zoom
                            };
                            item._layer._clickCallback(item._layer, item, ob);
                        }
                    }
                }
                return;
                break
        }


        //鼠标移动事件还是会进入这里


        this._insideRaiseEvent = true;

        var i;
        var listeners = this._listeners;
        var scopes = this._scopes;
        var length = listeners.length;

        for (i = 0; i < length; i++) {
            var listener = listeners[i];
            var scope = scopes[i];
            var array = [];
            for (var j = 0; j < object.features.length; j++) {
                var contain = scope.contains(object.features[j].feature);
                if (contain) {
                    array.push(object.features[j]);
                }
            }
            //var contain = scope.contains(object.features[0].feature);
            if (array.length > 0 && listener) {
                var result = {
                    coordinate: object.coordinate,
                    features: array,
                    screen: object.screen,
                    zoom: object.zoom
                }
                listener(scope, feature, result);
                //listeners[i].apply(scope, arguments);// 这个不知道为什么第一个参数传不进去
            }
        }
        // 实际上是移除removeEventListener中移除的项目。
        var toRemove = this._toRemove;
        length = toRemove.length;
        if (length > 0) {
            toRemove.sort(compareNumber);
            for (i = 0; i < length; i++) {
                var index = toRemove[i];
                listeners.splice(index, 1);
                scopes.splice(index, 1);
            }
            toRemove.length = 0;
        }

        this._insideRaiseEvent = false;
    }
    this.wmsraiseEvent = function (feature, object, type) {
        this._insideRaiseEvent = true;

        var i;
        var listeners = this._listeners;
        var scopes = this._scopes;
        var length = listeners.length;

        for (i = 0; i < length; i++) {
            var listener = listeners[i];
            var scope = scopes[i];
            var array = [];

            if (listener) {
                var result = {
                    coordinate: object.coordinate,
                    features: array,
                    screen: object.screen,
                    zoom: object.zoom
                }
                listener(scope, feature, result);
                //listeners[i].apply(scope, arguments);// 这个不知道为什么第一个参数传不进去
            }
        }
        // 实际上是移除removeEventListener中移除的项目。
        var toRemove = this._toRemove;
        length = toRemove.length;
        if (length > 0) {
            toRemove.sort(compareNumber);
            for (i = 0; i < length; i++) {
                var index = toRemove[i];
                listeners.splice(index, 1);
                scopes.splice(index, 1);
            }
            toRemove.length = 0;
        }

        this._insideRaiseEvent = false;
    }
    //地图缩放解释是的回调
    this.moveendEvent = function (zoom) {
        this._insideRaiseEvent = true;

        var i;
        var listeners = this._listeners;
        var scopes = this._scopes;
        var length = listeners.length;

        for (i = 0; i < length; i++) {
            var listener = listeners[i];
            var scope = scopes[i];
            var array = [];

            if (listener) {
                listener(scope, zoom);
            }
        }
        // 实际上是移除removeEventListener中移除的项目。
        var toRemove = this._toRemove;
        length = toRemove.length;
        if (length > 0) {
            toRemove.sort(compareNumber);
            for (i = 0; i < length; i++) {
                var index = toRemove[i];
                listeners.splice(index, 1);
                scopes.splice(index, 1);
            }
            toRemove.length = 0;
        }

        this._insideRaiseEvent = false;
    }
    this.raiseEventEmpty = function (object) {
        var i;
        var listeners = this._listeners;
        var scopes = this._scopes;
        var length = listeners.length;

        for (i = 0; i < length; i++) {
            var listener = listeners[i];
            var scope = scopes[i];
            listener(scope, null, object);
        }
    }

    /**
     * 取消注册以前注册的回调。
     * @param listener
     * @param scope
     */
    this.removeEventListener = function (listener, scope) {
        //>>includeStart('debug', pragmas.debug);
        //Check.typeOf.func("listener", listener);
        //>>includeEnd('debug');

        var listeners = this._listeners;
        var scopes = this._scopes;

        var index = -1;
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i] === listener && scopes[i] === scope) {
                index = i;
                break;
            }
        }

        if (index !== -1) {
            if (this._insideRaiseEvent) {
                //In order to allow removing an event subscription from within
                //a callback, we don't actually remove the items here.  Instead
                //remember the index they are at and undefined their value.
                this._toRemove.push(index);
                listeners[index] = undefined;
                scopes[index] = undefined;
            } else {
                listeners.splice(index, 1);
                scopes.splice(index, 1);
            }
            return true;
        }
        return false;
    }
}

function compareNumber(a, b) {
    return b - a;
}

export default Events;
