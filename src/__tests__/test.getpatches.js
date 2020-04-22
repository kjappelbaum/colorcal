import { distance } from 'mathjs';

import { testables } from '../getpatches';

const {
  getHeightPatch,
  getHeight,
  getVerticalPoints,
  getHorizontalPoints,
  getRowWidths,
  getColorPathCoordinates,
} = testables;

describe('Test get patches', () => {
  // Picked the coordinates on the test image by hand with imageJ

  const A = [422, 2085.33];
  const B = [2485.667, 2102.667];
  const C = [2491, 686.667];
  const D = [432.667, 769.33];
  const patchHeightADExpected = 294;
  const patchWidthsExpected = 275;
  const leftVerticalPointsExpected = [
    A,
    [418.5, 1747.5],
    [427.5, 1402.5],
    [426.5, 1055.5],
  ];

  const rightVerticalPointsExpected = [
    B,
    [2484.5, 1731.5],
    [2494.5, 1363.5],
    [2496.5, 989.5],
  ];

  const bottomHorizontalPointsExpected = [
    A,
    [758.5, 2090.5],
    [1100.5, 2091.5],
    [1447, 2094.5],
    [1798.833, 2098.833],
    [2169.5, 2100.167],
  ];

  const tolerance = 27; // my  picking doesn't seem better than this
  it('get height', () => {
    const heightPatch = getHeightPatch(getHeight(A, D));
    expect(heightPatch - patchHeightADExpected).toBeLessThan(tolerance);
  });
  it('testing the vertical points left', () => {
    const verticalPoints = getVerticalPoints(A, D);
    for (let i = 0; i < verticalPoints.length; i++) {
      expect(
        distance(verticalPoints[i], leftVerticalPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }
  });

  it('testing the vertical points right', () => {
    const verticalPoints = getVerticalPoints(B, C);
    for (let i = 0; i < verticalPoints.length; i++) {
      expect(
        distance(verticalPoints[i], rightVerticalPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }
  });

  it('testing the patch width', () => {
    const widths = getRowWidths(
      getVerticalPoints(A, D),
      getVerticalPoints(B, C),
    );
    widths.forEach((width) => {
      expect(Math.abs(width - 2059)).toBeLessThan(tolerance);
    });
  });

  it('test horizontal points', () => {
    const widths = getRowWidths(
      getVerticalPoints(A, D),
      getVerticalPoints(B, C),
    );
    const horizontalPoints = getHorizontalPoints(A, B, widths[0]);
    for (let i = 0; i < horizontalPoints.length; i++) {
      expect(
        distance(horizontalPoints[i], bottomHorizontalPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }
  });
});
