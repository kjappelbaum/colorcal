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

  const A = [422, 2087.33];
  const B = [2485.667, 2105.667];
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

  const topRightPointsExpectedLeft = [
    [705, 2089],
    [692, 1740],
    [701, 1389],
    [713, 1038],
  ];

  const topRightPointsExpected3 = [
    [1389.5, 2095],
    [1385.5, 1739],
    [1393.5, 1379],
    [1387.5, 1021],
  ];

  const bottomRightPointsExpected = [
    [692, 1797],
    [1031, 1797],
    [1385, 1797],
    [1742, 1794],
    [2102, 1794],
    [2486, 1794],
  ];

  const bottomRightPointExpected2 = [
    [695.5, 1443.5],
    [1034.5, 1440.5],
    [1378.5, 1436],
    [1745, 1439],
    [2105, 1423],
    [2485, 1419],
  ];

  const bottomLeftPointsExpected = [
    [410, 1802],
    [750.7, 1796.9],
    [1099.5, 1796],
    [1443.522, 1796.9],
    [1799.5, 1795],
    [2165.5, 1788],
  ];

  const bottomLeftPointExpected2 = [
    [438, 1476],
    [761.5, 1457.5],
    [1097.5, 1442],
    [1451.5, 1439],
    [1805.5, 1427],
    [2177.5, 1421.5],
  ];

  const tolerance = 40; // probably a bit high, but in this case the patches on the left are much shorter than the ones on the right due to map alignmnet of the camera
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
      expect(Math.abs(width - 2061)).toBeLessThan(tolerance);
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

  it('test get edge coordinates', () => {
    const coordinates = getColorPathCoordinates(A, B, C, D);
    expect(coordinates).toHaveLength(4);
    const topLeftPoints = coordinates[0];

    for (let i; i < topLeftPoints.length; i++) {
      expect(
        distance(topLeftPoints[i][0], leftVerticalPointsExpected[i]),
      ).toBeLessThan(tolerance);
      expect(
        distance(topLeftPoints[i][5], rightVerticalPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }

    const topRightPoints = coordinates[1];

    for (let i; i < topRightPoints.length; i++) {
      expect(
        distance(topRightPoints[i][0], topRightPointsExpectedLeft[i]),
      ).toBeLessThan(tolerance);
    }

    for (let i; i < topRightPoints.length; i++) {
      expect(
        distance(topRightPoints[i][2], topRightPointsExpected3[i]),
      ).toBeLessThan(tolerance);
    }

    const bottomRightPoints = coordinates[2];
    expect(bottomRightPoints).toHaveLength(4);
    for (let i; i < bottomRightPoints[0].length; i++) {
      expect(
        distance(bottomRightPoints[0][i], bottomRightPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }
    for (let i; i < bottomRightPoints[1].length; i++) {
      expect(
        distance(bottomRightPoints[1][i], bottomRightPointExpected2[i]),
      ).toBeLessThan(tolerance);
    }

    const bottomLeftPoints = coordinates[3];
    expect(bottomLeftPoints).toHaveLength(4);

    for (let i; i < bottomLeftPoints[0].length; i++) {
      expect(
        distance(bottomLeftPoints[0][i], bottomLeftPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }

    for (let i; i < bottomLeftPoints[1].length; i++) {
      expect(
        distance(bottomLeftPoints[1][i], bottomLeftPointExpected2[i]),
      ).toBeLessThan(tolerance);
    }
  });
});