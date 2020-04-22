/**
 * Get the averaged colors of the patches in a color checker card, following 10.1016/j.isprsjprs.2018.09.015
 * Only works if the distortion from rectangle is not too large
 */
import { distance } from 'mathjs';

const ratioGapPatch = 0.12; // to be checked
const vJumpFactor = (1 + ratioGapPatch) / (4 + 3 * ratioGapPatch);
const hJumpFactor = (1 + ratioGapPatch) / (6 + 5 * ratioGapPatch);

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
  return totalHeight / (patches + gaps * ratioGapPatch);
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
 * @returns
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

/*
We assume the height of the patches in each column is constant and calculate this here given the top and bottom points of each column
*/
function getColorPatchHeights(topPoints, bottomPoints) {
  let patchHeights = [];
  for (let i = 0; i < topPoints.length; i++) {
    patchHeights.push(getHeightPatch(topPoints[i], bottomPoints[i], 3, 3));
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
 * @returns
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
  for (let i = 0; i < topLeftPoints; i++) {
    let toprightRow = [];
    for (let j = 0; j < topLeftPoints[i].length; j++) {
      let point = topRightPoints[i][j];
      toprightRow.push([point[0] + getHJump(rowWidths[j]), point[1]]);
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
    for (let j = 0; i < topLeftPoints.length; j++) {
      let point = topLeftPoints[i][j];
      bottomLeftRow.push([point[0], point[1] + patchHeights[j]]);
    }
    bottomLeftPoints.push(bottomLeftRow);
  }

  let bottomRightPoints = [];
  for (let i = 0; i < topRightPoints.length; i++) {
    let bottomRightRow = [];
    for (let j = 0; i < topRightPoints.length; j++) {
      let point = topRightPoints[i][j];
      bottomRightRow.push([point[0], point[1] + patchHeights[j]]);
    }
    bottomRightPoints.push(bottomRightRow);
  }

  return [topLeftPoints, topRightPoints, bottomRightPoints, bottomLeftPoints];
}

function getROIs(
  topLeftPoints,
  topRightPoints,
  bottomRightPoints,
  bottomLeftPoints,
) {
  const topLeftPointROIs = [];
  const topRightPointROIs = [];
  const bottomRightPointROIs = [];
  const bottomLeftPointROIs = [];
}

export const testables = {
  getHeightPatch: getHeightPatch,
  getHeight: getHeight,
  getVerticalPoints: getVerticalPoints,
  getHorizontalPoints: getHorizontalPoints,
  getRowWidths: getRowWidths,
  getColorPathCoordinates: getColorPathCoordinates,
};
