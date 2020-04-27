import { join } from 'path';

import { trace, sum } from 'mathjs';

import { getCalibrationMatrix, calibrateImage } from '../calibrate';
import { testables2 } from '../getpatches';

const referenceColors = require('../spydercheckr24.json');

const { getImageData } = testables2;

describe('test the computation of the calibration matrix', () => {
  it('get calibration matrix from reference picture', () => {
    const calibrationMatrix = getCalibrationMatrix(
      referenceColors,
      referenceColors,
    );

    expect(Math.abs(trace(calibrationMatrix) - 3)).toBeLessThan(0.0000001);
    expect(Math.abs(sum(calibrationMatrix) - 3)).toBeLessThan(0.0000001);
  });

  it('rewrite image data', async () => {
    const imageData = await getImageData(
      join(__dirname, '../__tests__/data/Datacolor-SpyderCheker24_Lead.jpg'),
    );

    const calibrationMatrixIdentity = getCalibrationMatrix(
      referenceColors,
      referenceColors,
    );

    const rewrittenImage = calibrateImage(imageData, calibrationMatrixIdentity);

    expect(rewrittenImage).toStrictEqual(imageData);
  });
});
