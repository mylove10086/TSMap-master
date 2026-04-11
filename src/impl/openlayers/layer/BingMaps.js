/**
 * Created by  on 2022/5/23.
 */

class BingMaps {
    static getBingMaps(url) {
        var gaodeLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                tileUrlFunction: function (tileCoord) {
                    const z = tileCoord[0];
                    const digits = new Array(z);
                    let mask = 1 << (z - 1);
                    var i, charCode;
                    for (i = 0; i < z; ++i) {
                        // 48 is charCode for 0 - '0'.charCodeAt(0)
                        charCode = 48;
                        if (tileCoord[1] & mask) {
                            charCode += 1;
                        }
                        if (tileCoord[2] & mask) {
                            charCode += 2;
                        }
                        digits[i] = String.fromCharCode(charCode);
                        mask >>= 1;
                    }
                    var quadkey = "a" + digits.join('');
                    var u= url.replace("{quadkey}",quadkey);
                    return u;
                }
            })
        });
        return gaodeLayer;

    }

}
export default BingMaps;