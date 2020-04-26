/**
 * Get the averaged colors of the patches in a color checker card, following 10.1016/j.isprsjprs.2018.09.015
 * Only works if the distortion from rectangle is not too large
 * ToDo: Potentially we can make much more stuff average
 * Todo: Make number of columns etc. options of the functions
 */
import { Image } from 'image-js';
import { distance, index, range, flatten, mean, matrix, round } from 'mathjs';

const ratioGapPatchH = 0.18; // to be checked
const ratioGapPatchV = 0.18; // to be checked
const vJumpFactor = (1 + ratioGapPatchV) / (4 + 3 * ratioGapPatchV);
const hJumpFactor = (1 + ratioGapPatchH) / (6 + 5 * ratioGapPatchH);
const roiTolerance = 0.4;

/**
 *Euclidean distance between points
 *
 * @param {Array} pointA
 * @param {Array} pointB
 * @returns
 */
function getHeight(pointA, pointB) {
  return distance(pointA, pointB);
}

function getHeightPatch(totalHeight, patches = 4, gaps = 3) {
  return totalHeight / (patches + gaps * ratioGapPatchV);
}

function getSlope(pointA, pointB) {
  return (pointA[1] - pointB[1]) / (pointA[0] - pointB[0]);
}

/*
Eq. A4
*/
function getVJump(height) {
  return height * vJumpFactor;
}

/*
Eq. A8
*/
function getHJump(width) {
  return width * hJumpFactor;
}

/*
Eq. A5/A6, A9/A10
*/
function getNextPoint(point, slope, jumpLength) {
  const denom = Math.sqrt(1 + Math.pow(slope, 2));
  const x = jumpLength / denom;
  const y = (slope * jumpLength) / denom;
  return [point[0] + x, point[1] + y];
}

/**
 *
 *
 * @param {Array} pointA
 * @param {Array} pointB
 * @param {number} [nRows=4]
 * @returns {Array} vertical points
 */
function getVerticalPoints(pointA, pointB, nRows = 4) {
  let verticalPoints = [];
  const slope = getSlope(pointA, pointB);
  const height = getHeight(pointA, pointB);
  const vJump = getVJump(height);
  let currentPoint = pointA;

  verticalPoints.push(currentPoint);
  for (let i = 1; i < nRows; i++) {
    let nextPoint = getNextPoint(currentPoint, slope, vJump);
    verticalPoints.push(nextPoint);
    currentPoint = nextPoint;
  }

  return verticalPoints;
}

/**
 *
 *
 * @param {Array} pointA
 * @param {Array} pointB
 * @param {number} width  width of the patch
 * @param {number} [nCols=6]
 * @returns {Array} horizontal points
 */
function getHorizontalPoints(pointA, pointB, width, nCols = 6) {
  let horizontalPoints = [];
  const hJump = getHJump(width);

  const slope = getSlope(pointA, pointB);
  let currentPoint = pointA;

  horizontalPoints.push(currentPoint);
  for (let i = 1; i < nCols; i++) {
    let nextPoint = getNextPoint(currentPoint, slope, hJump);
    horizontalPoints.push(nextPoint);
    currentPoint = nextPoint;
  }

  return horizontalPoints;
}

/*
eq. A7
*/
function getRowWidths(leftPoints, rightPoints) {
  let rowWidths = [];
  for (let i = 0; i < leftPoints.length; i++) {
    rowWidths.push(distance(leftPoints[i], rightPoints[i]));
  }

  return rowWidths;
}

/**
 * We assume the height of the patches in each column is constant and calculate this here given the top and bottom points of each column
 *
 * @param {Array} topPoints
 * @param {Array} bottomPoints
 * @returns {Array} of heights
 */
function getColorPatchHeights(topPoints, bottomPoints) {
  let patchHeights = [];
  for (let i = 0; i < topPoints.length; i++) {
    patchHeights.push(
      getHeightPatch(distance(topPoints[i], bottomPoints[i]), 3, 3),
    );
  }
  return patchHeights;
}

/**
 *
 *
 * @param {Array} pointA: edge of black box
 * @param {Array} pointB: edge of whiteish box
 * @param {Array} pointC: edge of turquise box
 * @param {Array} pointD: edge of dark skin box
 * @returns {Array} topleft, topright, bottomright, bottomleft points
 */
function getColorPathCoordinates(pointA, pointB, pointC, pointD) {
  const leftPoints = getVerticalPoints(pointA, pointD);
  const rightPoints = getVerticalPoints(pointB, pointC);

  const rowWidths = getRowWidths(leftPoints, rightPoints);

  let topLeftPoints = [];
  for (let i = 0; i < rowWidths.length; i++) {
    topLeftPoints.push(
      getHorizontalPoints(leftPoints[i], rightPoints[i], rowWidths[i]),
    );
  }

  let topRightPoints = [];
  for (let i = 0; i < topLeftPoints.length; i++) {
    let toprightRow = [];
    let hJump = getHeightPatch(rowWidths[i], 6, 5);
    for (let j = 0; j < topLeftPoints[i].length; j++) {
      let point = topLeftPoints[i][j];
      toprightRow.push([point[0] + hJump, point[1]]);
    }
    topRightPoints.push(toprightRow);
  }

  // now, get the heights of the patch in each column
  const patchHeights = getColorPatchHeights(
    topLeftPoints[0],
    topLeftPoints[topLeftPoints.length - 1],
  );

  let bottomLeftPoints = [];
  for (let i = 0; i < topLeftPoints.length; i++) {
    let bottomLeftRow = [];
    for (let j = 0; j < topLeftPoints[i].length; j++) {
      let point = topLeftPoints[i][j];
      bottomLeftRow.push([point[0], point[1] - patchHeights[j]]);
    }
    bottomLeftPoints.push(bottomLeftRow);
  }

  let bottomRightPoints = [];
  for (let i = 0; i < topRightPoints.length; i++) {
    let bottomRightRow = [];
    for (let j = 0; j < topRightPoints[i].length; j++) {
      let point = topRightPoints[i][j];
      bottomRightRow.push([point[0], point[1] - patchHeights[j]]);
    }
    bottomRightPoints.push(bottomRightRow);
  }

  return [topLeftPoints, topRightPoints, bottomRightPoints, bottomLeftPoints];
}

/**
 *
 *
 * @param {Array} topLeftPoint
 * @param {Array} topRightPoint
 * @param {Array} bottomRightPoint
 * @param {Array} bottomLeftPoint
 * @param {Number} [tolerance=roiTolerance]
 * @returns {Array} points of a rectangular ROI frame
 */
function getROIcoordinates(
  topLeftPoint,
  topRightPoint,
  bottomRightPoint,
  bottomLeftPoint,
  tolerance = roiTolerance,
) {
  const xLeft = Math.max(topLeftPoint[0], bottomLeftPoint[0]);
  const xRight = Math.min(topRightPoint[0], bottomRightPoint[0]);

  const yTop = Math.min(topLeftPoint[1], topRightPoint[1]);
  const yBottom = Math.min(bottomLeftPoint[1], bottomRightPoint[1]);

  const xDistance = Math.abs(xRight - xLeft);
  const yDistance = Math.abs(yTop - yBottom);

  // Let's use a rectangle instead. this makes life a lot easier.
  const topLeftNew = [
    round(xLeft + tolerance * xDistance),
    round(yTop - tolerance * yDistance),
  ];
  const topRightNew = [
    round(xRight - tolerance * xDistance),
    round(yTop - tolerance * yDistance),
  ];
  const bottomRightNew = [
    round(xRight - tolerance * xDistance),
    round(yBottom + tolerance * yDistance),
  ];

  const bottomLeftNew = [
    round(xLeft + tolerance * xDistance),
    round(yBottom + tolerance * yDistance),
  ];
  return [topLeftNew, topRightNew, bottomRightNew, bottomLeftNew];
}

/**
 *
 *
 * @param {Array} topLeftPoints
 * @param {Array} topRightPoints
 * @param {Array} bottomRightPoints
 * @param {Array} bottomLeftPoints
 * @returns {Array} starting at A - B - C -D with all the border coordinates for the ROIs
 */
function getROIs(
  topLeftPoints,
  topRightPoints,
  bottomRightPoints,
  bottomLeftPoints,
) {
  let rois = [];
  // iterate over the row and then the columns and get the ROI for each patch
  for (let i = 0; i < topLeftPoints.length; i++) {
    for (let j = 0; j < topLeftPoints[i].length; j++) {
      rois.push(
        getROIcoordinates(
          topLeftPoints[i][j],
          topRightPoints[i][j],
          bottomRightPoints[i][j],
          bottomLeftPoints[i][j],
        ),
      );
    }
  }
  return rois;
}

// todo make async clearer
function getImageData(imagePath) {
  const imageData = Image.load(imagePath).then(function (image) {
    const components = image.split();
    return [
      components[0].getMatrix(),
      components[1].getMatrix(),
      components[2].getMatrix(),
    ];
  });
  return imageData;
}

/**
 *
 *
 * @param {Array} rgbMatrix: Matrix with three channels
 * @param {Array} roi: Array with four entries for topleft, topright, bottomright, bottomleft point of the ROI in which the averaging will be performed
 * @returns {Array}: Averaged RGB colors
 */
function getRGBAverage(rgbMatrix, roi) {

  const selection = index(
    range(Math.min(roi[0][1], roi[2][1]), Math.max(roi[0][1], roi[2][1])),
    range(Math.min(roi[0][0], roi[1][0]), Math.max(roi[0][0], roi[1][0])),
  );

  const r = mean(flatten(matrix(rgbMatrix[0]).subset(selection)));
  const g = mean(flatten(matrix(rgbMatrix[1]).subset(selection)));
  const b = mean(flatten(matrix(rgbMatrix[2]).subset(selection)));

  return [round(r), round(g), round(b)];
}

function getRGBAverages(rgbMatrix, rois) {
  let rgbAverages = [];

  for (let i = 0; i < rois.length; i++) {
    rgbAverages.push(getRGBAverage(rgbMatrix, rois[i]));
  }

  return rgbAverages;
}

export async function getRGBAveragesFromCard(
  imagePath,
  pointA,
  pointB,
  pointC,
  pointD,
) {
  const imageData = await getImageData(imagePath);
  const roiCoordinates = getColorPathCoordinates(
    pointA,
    pointB,
    pointC,
    pointD,
  );

  const rois = getROIs(...roiCoordinates);
  const rgbAverages = getRGBAverages(imageData, rois);
  return rgbAverages;
}

export const testables = {
  getHeightPatch: getHeightPatch,
  getHeight: getHeight,
  getVerticalPoints: getVerticalPoints,
  getHorizontalPoints: getHorizontalPoints,
  getRowWidths: getRowWidths,
  getColorPathCoordinates: getColorPathCoordinates,
  getROIs: getROIs,
  getImageData: getImageData,
  getRGBAverage: getRGBAverage,
  getRGBAverages: getRGBAverages,
  getROIcoordinates: getROIcoordinates,
};
