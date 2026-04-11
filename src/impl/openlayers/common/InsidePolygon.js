/**
 * 判断点在多边形内
 * @param points 多边形的范围，数组 [[x,y]]
 * @param testPoint 要判断的点坐标，[x,y]
 * @returns {boolean} 如果testpoint在points的多边形内返回true，不在返回false
 */
let insidePolygon = function (points, testPoint) {
  let x = testPoint[0], y = testPoint[1];
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    let xi = points[i][0], yi = points[i][1];
    let xj = points[j][0], yj = points[j][1];

    let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export default insidePolygon;
