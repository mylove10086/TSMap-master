function isPlainObject(obj) {
    var proto, Ctor;

    // 排除掉明显不是obj的以及一些宿主对象如Window
    if (!obj || toString.call(obj) !== "[object Object]") {
        return false;
    }

    /**
     * getPrototypeOf es5 方法，获取 obj 的原型
     * 以 new Object 创建的对象为例的话
     * obj.__proto__ === Object.prototype
     */
    proto = Object.getPrototypeOf(obj);

    // 没有原型的对象是纯粹的，Object.create(null) 就在这里返回 true
    if (!proto) {
        return true;
    }

    /**
     * 以下判断通过 new Object 方式创建的对象
     * 判断 proto 是否有 constructor 属性，如果有就让 Ctor 的值为 proto.constructor
     * 如果是 Object 函数创建的对象，Ctor 在这里就等于 Object 构造函数
     */
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;

    // 在这里判断 Ctor 构造函数是不是 Object 构造函数，用于区分自定义构造函数和 Object 构造函数
    return typeof Ctor === "function" && hasOwn.toString.call(Ctor) === hasOwn.toString.call(Object);
}

function isFunction(obj) {
    return type(obj) === "function";
}

var isArray = Array.isArray || function( obj ) {
    return type(obj) === "array";
}

export function extend() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {}, // 默认第0个参数为目标参数
        i = 1,    // i表示从第几个参数凯斯想目标参数进行合并，默认从第1个参数开始向第0个参数进行合并
        length = arguments.length,
        deep = false;  // 默认为浅度拷贝

    // 判断第0个参数的类型，若第0个参数是boolean类型，则获取其为true还是false
    // 同时将第1个参数作为目标参数，i从当前目标参数的下一个
    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;

        // Skip the boolean and the target
        target = arguments[ i ] || {};
        i++;
    }

    //     判断目标参数的类型，若目标参数既不是object类型，也不是function类型，则为目标参数重新赋值
    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !isFunction(target) ) {
        target = {};
    }

    // 若目标参数后面没有参数了，如$.extend({_name:'wenzi'}), $.extend(true, {_name:'wenzi'})
    // 则目标参数即为jQuery本身，而target表示的参数不再为目标参数
    // Extend jQuery itself if only one argument is passed
    if ( i === length ) {
        target = this;
        i--;
    }

    // 从第i个参数开始
    for ( ; i < length; i++ ) {
        // 获取第i个参数，且该参数不为null和undefind，在js中null和undefined，如果不区分类型，是相等的，null==undefined为true，
        // 因此可以用null来同时过滤掉null和undefind
        // 比如$.extend(target, {}, null);中的第2个参数null是不参与合并的
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {

            // 使用for~in获取该参数中所有的字段
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];   // 目标参数中name字段的值
                copy = options[ name ]; // 当前参数中name字段的值

                // 若参数中字段的值就是目标参数，停止赋值，进行下一个字段的赋值
                // 这是为了防止无限的循环嵌套，我们把这个称为，在下面进行比较详细的讲解
                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // 若deep为true，且当前参数中name字段的值存在且为object类型或Array类型，则进行深度赋值
                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
                    // 若当前参数中name字段的值为Array类型
                    // 判断目标参数中name字段的值是否存在，若存在则使用原来的，否则进行初始化
                    if ( copyIsArray ) {
                        copyIsArray = false;
                        clone = src && isArray(src) ? src : [];

                    } else {
                        // 若原对象存在，则直接进行使用，而不是创建
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // 递归处理，此处为2.2
                    // Never move original objects, clone them
                    target[ name ] = extend( deep, clone, copy );

                    // deep为false，则表示浅度拷贝，直接进行赋值
                    // 若copy是简单的类型且存在值，则直接进行赋值
                    // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    // 若原对象存在name属性，则直接覆盖掉；若不存在，则创建新的属性
                    target[ name ] = copy;
                }
            }
        }
    }

    // 返回修改后的目标参数
    // Return the modified object
    return target;
};

export const extend2 = typeof Object.extend === 'function' ? Object.extend : function (target) {
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    const output = Object(target);

    for (let i = 1, ii = arguments.length; i < ii; ++i) {
        const source = arguments[i];

        if (source !== undefined && source !== null) {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    output[key] = source[key];
                }
            }
        }
    }

    return output;
};

export function isDefined(object) {
    return object !== undefined && object !== null
}

export function isUndefined(object) {
    return !isDefined(object)
}

export function hasUndefined() {
    for (let i = 0; i < arguments.length; i++) {
        if (!isUndefined(arguments[i])) {
            return false;
        }
    }

    return true;
}

export class isNotDefined {
}
