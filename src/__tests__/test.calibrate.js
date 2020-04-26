import { trace, sum } from 'mathjs';

import { getCalibrationMatrix } from '../calibrate';

const referenceColors = require('../spydercheckr24.json');

describe('test the computation of the calibration matrix', () => {
  it('get calibration matrix from reference picture', () => {
    const calibrationMatrix = getCalibrationMatrix(
      referenceColors,
      referenceColors,
    );

    expect(Math.abs(trace(calibrationMatrix) - 3)).toBeLessThan(0.0000001);
    expect(Math.abs(sum(calibrationMatrix) - 3)).toBeLessThan(0.0000001);
    console.log(calibrationMatrix);
  });
});
