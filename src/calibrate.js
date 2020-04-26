import { matrix, transpose, multiply, inv } from 'mathjs';

const referenceColors = require('./spydercheckr24.json');

/**
 *Calculate the color calobration matrix given the measure colors
 *from the color patches and the standard colors
 *
 * @export
 * @param {Array} actualColors
 * @param {Array} [referenceColors=referenceColors]
 * @returns {Matrix} colorcalibration matrix
 */
export function getCalibrationMatrix(
  actualColors,
  referenceColors = referenceColors,
) {
  const actualColors = matrix(actualColors);
  const actualColorsT = transpose(actualColors);

  const referenceColors = matrix(referenceColors);

  const rhsA = multiply(referenceColors, actualColorsT);
  const rhsB = multiply(actualColors, actualColorsT);

  const rhsBInverse = inv(rhsB);
  const ccm = multiply(rhsA, rhsBInverse);

  return ccm;
}

/**
 *
 *
 * @export
 * @param {Array} imageData
 * @param {Matrix} calibrationMatrix
 * @returns {Matrix} calibrated image 
 */
export function calibrateImage(imageData, calibrationMatrix) {
  const imageData = matrix(imageData);
  const calibratedImage = multiply(calibrationMatrix, imageData);
  return calibrateImage;
}
