export const MapEngineType = {
    OPENLAYERS: 'OPENLAYERS',
    LEAFLET: 'LEAFLET',
    ARCGIS: 'ARCGIS',
    MAMBOX_GL: 'MAMBOX_GL'
};

export const BaseMapType = {
    TIANDITU: 'TIANDITU',
    EGIS: 'EGIS',
    BAIDU: 'BAIDU',
    AMAP: 'AMAP',
    YUZHENGTU: 'YUZHENGTU',
    GOOGLE: 'GOOGLE',
    ARCGIS: 'ARCGIS'
};

export const BaseMapLayerType = {
    VEC_C: 'vec_c',
    CVA_W: 'cva_w',
    IMG_W: 'img_w',
    CIA_W: 'cia_w',
    BAIDU: 'baidu',
    BINGMAP: 'bingmap',
    blue: 'blue',
    community: 'community',
    gray: 'gray',
    topo: 'topo',
    URL: 'url',
};

export const DefaultOptions = {
    ZOOM: 8,
    /*MIN_ZOOM: 3,
    MAX_ZOOM: 18.5,*/
    CENTER: [113.0000, 23.0000],
    PROJECTION: 4326,
    TARGET: 'map',
    BASE_MAP: BaseMapType.TIANDITU,
    GEOM: 'geom',
    CIRCLE_POINT_COUNT: 90,
    TRACK_SPEED: 100
};

export const GraphicType = {
    CIRCLE: 'Circle',
    RADIUS_CIRCLE: 'RadiusCircle',
    POINT: 'Point',
    TEXT: 'Text',
    LINE_STRING: 'LineString',
    POLYGON: 'Polygon',
    BOX: 'Box',
    SQUARE: 'Square',
    FINEARROW: 'FineArrow',// 单箭头
    ATTACKARROW: 'AttackArrow',//燕尾箭头
    PINCERARROW: 'PincerArrow',//双箭头
    CurveAlgorithm: 'CurveAlgorithm',//双箭头
    EllipseGeom: 'Ellipse'//双箭头
};

/**
 * 在线地图 链接没有https
 * @constructor
 */
export const BaseMapLayerUrlMap = new Map([
    [BaseMapType.TIANDITU, new Map([
        [BaseMapLayerType.IMG_W, "http://t{0-7}.tianditu.gov.cn/img_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        //影像注记
        [BaseMapLayerType.CIA_W, "http://t{0-7}.tianditu.gov.cn/cia_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        //矢量底图
        [BaseMapLayerType.VEC_C, "http://t{0-7}.tianditu.gov.cn/vec_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        //矢量注记
        [BaseMapLayerType.CVA_W, "http://t{0-7}.tianditu.gov.cn/cva_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        [BaseMapLayerType.BAIDU, "https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20220221&scale=1&ak=LPQAVkzSThbmIRI1YVo8VuzwlTrQG9T1&styles=t%3Aland%7Ce%3Ag%7Cc%3A%230A1831%2Ct%3Abuilding%7Ce%3Ag%7Cc%3A%231D325E%2Ct%3Ahighway%7Ce%3Aall%7Cl%3A-42%7Cs%3A-91%2Ct%3Aarterial%7Ce%3Ag%7Cl%3A-77%7Cs%3A-94%2Ct%3Agreen%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Awater%7Ce%3Ag%7Cc%3A%23181818%2Ct%3Asubway%7Ce%3Ag.s%7Cc%3A%23181818%2Ct%3Arailway%7Ce%3Ag%7Cl%3A-52%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23313131%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%238b8787%2Ct%3Amanmade%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Alocal%7Ce%3Ag%7Cc%3A%23ef10adff%7Cl%3A-75%7Cs%3A-91%7Ch%3A%239f2424%2Ct%3Asubway%7Ce%3Ag%7Cl%3A-65%2Ct%3Arailway%7Ce%3Aall%7Cl%3A-40%2Ct%3Aroad%7Ce%3Ag%7Cc%3A%231890ffff%7Cl%3A-69%7Cw%3A1%7Ch%3A%231890ff"]
    ])],
    [BaseMapType.AMAP, new Map([
        [BaseMapLayerType.IMG_W, "http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}&tk="],

        //影像注记
        [BaseMapLayerType.CIA_W, "http://t{0-7}.tianditu.gov.cn/cia_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],

        //矢量底图
        [BaseMapLayerType.VEC_C, "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&tk="],

        //矢量注记
        [BaseMapLayerType.CVA_W, "http://t{0-7}.tianditu.gov.cn/cva_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="]
    ])],
    [BaseMapType.ARCGIS, new Map([
        [BaseMapLayerType.IMG_W, "https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}"]
    ])]
]);
/**
 * 链接使用https
 *
 * @type {Map<*, *>}
 */
export const BaseMapLayerUrlMaps = new Map([
    [BaseMapType.TIANDITU, new Map([
        [BaseMapLayerType.IMG_W, "https://t{0-7}.tianditu.gov.cn/img_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        //影像注记
        [BaseMapLayerType.CIA_W, "https://t{0-7}.tianditu.gov.cn/cia_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        //矢量底图
        [BaseMapLayerType.VEC_C, "https://t{0-7}.tianditu.gov.cn/vec_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        //矢量注记
        [BaseMapLayerType.CVA_W, "https://t{0-7}.tianditu.gov.cn/cva_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],
        [BaseMapLayerType.BAIDU, "https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20220221&scale=1&ak=LPQAVkzSThbmIRI1YVo8VuzwlTrQG9T1&styles=t%3Aland%7Ce%3Ag%7Cc%3A%230A1831%2Ct%3Abuilding%7Ce%3Ag%7Cc%3A%231D325E%2Ct%3Ahighway%7Ce%3Aall%7Cl%3A-42%7Cs%3A-91%2Ct%3Aarterial%7Ce%3Ag%7Cl%3A-77%7Cs%3A-94%2Ct%3Agreen%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Awater%7Ce%3Ag%7Cc%3A%23181818%2Ct%3Asubway%7Ce%3Ag.s%7Cc%3A%23181818%2Ct%3Arailway%7Ce%3Ag%7Cl%3A-52%2Ct%3Aall%7Ce%3Al.t.s%7Cc%3A%23313131%2Ct%3Aall%7Ce%3Al.t.f%7Cc%3A%238b8787%2Ct%3Amanmade%7Ce%3Ag%7Cc%3A%231b1b1b%2Ct%3Alocal%7Ce%3Ag%7Cc%3A%23ef10adff%7Cl%3A-75%7Cs%3A-91%7Ch%3A%239f2424%2Ct%3Asubway%7Ce%3Ag%7Cl%3A-65%2Ct%3Arailway%7Ce%3Aall%7Cl%3A-40%2Ct%3Aroad%7Ce%3Ag%7Cc%3A%231890ffff%7Cl%3A-69%7Cw%3A1%7Ch%3A%231890ff"]

    ])],
    [BaseMapType.AMAP, new Map([
        [BaseMapLayerType.IMG_W, "http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}&tk="],

        //影像注记
        [BaseMapLayerType.CIA_W, "https://t{0-7}.tianditu.gov.cn/cia_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="],

        //矢量底图
        [BaseMapLayerType.VEC_C, "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&tk="],

        //矢量注记
        [BaseMapLayerType.CVA_W, "https://t{0-7}.tianditu.gov.cn/cva_w/wmts?" +
        "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
        "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk="]
    ])],
    [BaseMapType.ARCGIS, new Map([
        [BaseMapLayerType.IMG_W, "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"]
    ])]
]);
