import { matrix, transpose, multiply, inv, reshape } from 'mathjs';

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
  const actualColorsT = matrix(actualColors);
  const actualColorsM = transpose(actualColorsT);

  const referenceColorsM = transpose(matrix(referenceColors));

  const rhsA = multiply(referenceColorsM, actualColorsT);
  const rhsB = multiply(actualColorsM, actualColorsT);

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
 * @returns {Array} calibrated image data
 */
export function calibrateImage(imageData, calibrationMatrix) {
  const width = imageData[0].length;
  const height = imageData[0][0].length;
  let imageDataRe = matrix([
    imageData[0].flat(),
    imageData[1].flat(),
    imageData[2].flat(),
  ]);

  let calibratedImage = multiply(calibrationMatrix, imageDataRe);

  // let r = subset(calibratedImage, index(0, range(0, width * height - 1)));
  // let g = subset(calibratedImage, index(1, range(0, width * height - 1)));
  // let b = subset(calibratedImage, index(2, range(0, width * height - 1)));
  calibratedImage = reshape(calibratedImage, [3, width, height]);

  return calibratedImage;
}
