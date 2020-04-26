import { join } from 'path';

import { distance } from 'mathjs';

import { testables, getRGBAveragesFromCard } from '../getpatches';

const {
  getHeightPatch,
  getHeight,
  getVerticalPoints,
  getHorizontalPoints,
  getRowWidths,
  getColorPathCoordinates,
  getROIs,
  getImageData,
  getRGBAverage,
  getRGBAverages,
  // eslint-disable-next-line no-unused-vars
  getROIcoordinates,
} = testables;

describe('Test image loading', () => {
  const blackPatchReference = [41, 32, 32];
  const redPatchReference = [200, 38, 46];
  const blackPatchReferenceIMG5248 = [26, 41, 49];
  const rgbLastPatch = [111, 174, 156];
  const rgbMinus3Patch = [68, 89, 55];
  const roiLastPatch = [
    [2225, 953],
    [2423, 941],
    [2465, 743],
    [2261, 737],
  ];
  const roiBlackPatchIMG5248 = [
    [468, 2022],
    [659, 2009],
    [647, 1853],
    [485, 1853],
  ];
  const roiBlackPatchIMG52482 = [
    [482, 2029],
    [662, 2029],
    [662, 1854],
    [482, 1854],
  ];

  const rgbTolerance = 4;
  const roiBlackPatchReference = [
    [37, 45],
    [118, 41],
    [113, 110],
    [48, 116],
  ];
  const roiRedReferencePatch = [
    [282, 185],
    [312, 184],
    [311, 211],
    [286, 211],
  ];

  it('test the averaging', async () => {
    const imageData = await getImageData(
      join(__dirname, '../__tests__/data/Datacolor-SpyderCheker24_Lead.jpg'),
    );

    const colorsBlack = getRGBAverage(imageData, roiBlackPatchReference);
    for (let i = 0; i < colorsBlack.length; i++) {
      expect(Math.abs(colorsBlack[i] - blackPatchReference[i])).toBeLessThan(
        rgbTolerance,
      );
    }

    const colorsRed = getRGBAverage(imageData, roiRedReferencePatch);

    for (let i = 0; i < colorsRed.length; i++) {
      expect(Math.abs(colorsRed[i] - redPatchReference[i])).toBeLessThan(
        rgbTolerance,
      );
    }

    const rois = [roiBlackPatchReference, roiRedReferencePatch];
    const colorsAveraged = getRGBAverages(imageData, rois);

    for (let i = 0; i < colorsAveraged[1].length; i++) {
      expect(
        Math.abs(colorsAveraged[1][i] - redPatchReference[i]),
      ).toBeLessThan(rgbTolerance);
    }

    for (let i = 0; i < colorsAveraged[0].length; i++) {
      expect(
        Math.abs(colorsAveraged[0][i] - blackPatchReference[i]),
      ).toBeLessThan(rgbTolerance);
    }
  });

  it('test the averaging on another image', async () => {
    const imageData = await getImageData(
      join(__dirname, '../__tests__/data/IMG_5248.jpg'),
    );
    const colorsBlack = getRGBAverage(imageData, roiBlackPatchIMG5248);
    for (let i = 0; i < colorsBlack.length; i++) {
      expect(
        Math.abs(colorsBlack[i] - blackPatchReferenceIMG5248[i]),
      ).toBeLessThan(rgbTolerance);
    }

    const rois = [roiBlackPatchIMG5248, roiLastPatch, roiBlackPatchIMG52482];
    const colorsAveraged = getRGBAverages(imageData, rois);

    for (let i = 0; i < colorsAveraged[1].length; i++) {
      expect(Math.abs(colorsAveraged[1][i] - rgbLastPatch[i])).toBeLessThan(
        rgbTolerance,
      );
    }

    for (let i = 0; i < colorsAveraged[0].length; i++) {
      expect(
        Math.abs(colorsAveraged[0][i] - blackPatchReferenceIMG5248[i]),
      ).toBeLessThan(rgbTolerance);
    }

    for (let i = 0; i < colorsAveraged[2].length; i++) {
      expect(
        Math.abs(colorsAveraged[2][i] - blackPatchReferenceIMG5248[i]),
      ).toBeLessThan(rgbTolerance);
    }
  });
});

describe('Test get patches', () => {
  // Picked the coordinates on the test image by hand with imageJ

  const A = [426, 2083];
  const B = [2479, 2098];
  const C = [2485, 692];
  const D = [438, 773];
  const patchHeightADExpected = 294;

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
    [1392, 2090],
    [1392, 1736],
    [1393, 1380],
    [1395, 1022],
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
    [1387, 1436],
    [1745, 1439],
    [2111, 1423],
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

  const topLeftPointExpected5 = [
    [2176, 2094],
    [2183, 1729],
    [2187, 1357],
    [2187, 993],
  ];

  const tolerance = 45; // probably a bit (too) high, but in this case the patches on the left are much shorter than the ones on the right due to map alignmnet of the camera
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

    for (let i = 0; i < topLeftPoints.length; i++) {
      expect(
        distance(topLeftPoints[i][0], leftVerticalPointsExpected[i]),
      ).toBeLessThan(tolerance);

      expect(
        distance(topLeftPoints[i][5], topLeftPointExpected5[i]),
      ).toBeLessThan(tolerance);
    }

    const topRightPoints = coordinates[1];

    for (let i = 0; i < topRightPoints.length; i++) {
      expect(
        distance(topRightPoints[i][0], topRightPointsExpectedLeft[i]),
      ).toBeLessThan(tolerance);
    }

    for (let i = 0; i < topRightPoints.length; i++) {
      expect(
        distance(topRightPoints[i][2], topRightPointsExpected3[i]),
      ).toBeLessThan(tolerance);
    }

    const bottomRightPoints = coordinates[2];
    expect(bottomRightPoints).toHaveLength(4);
    for (let i = 0; i < bottomRightPoints[0].length; i++) {
      expect(
        distance(bottomRightPoints[0][i], bottomRightPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }
    for (let i = 0; i < bottomRightPoints[1].length; i++) {
      console.log(bottomRightPoints[1][i], bottomRightPointExpected2[i]);
      expect(
        distance(bottomRightPoints[1][i], bottomRightPointExpected2[i]),
      ).toBeLessThan(tolerance);
    }

    const bottomLeftPoints = coordinates[3];
    expect(bottomLeftPoints).toHaveLength(4);

    for (let i = 0; i < bottomLeftPoints[0].length; i++) {
      expect(
        distance(bottomLeftPoints[0][i], bottomLeftPointsExpected[i]),
      ).toBeLessThan(tolerance);
    }

    for (let i = 0; i < bottomLeftPoints[1].length; i++) {
      expect(
        distance(bottomLeftPoints[1][i], bottomLeftPointExpected2[i]),
      ).toBeLessThan(tolerance);
    }
  });

  it('test ROIs', () => {
    const coordinates = getColorPathCoordinates(A, B, C, D);
    const rois = getROIs(...coordinates);
    expect(rois).toHaveLength(24);
  });

  it('test the whole thing', async () => {
    const rgbMeasured = await getRGBAveragesFromCard(
      join(__dirname, '../__tests__/data/IMG_5248.jpg'),
      A,
      B,
      C,
      D,
    );

    for (let i = 0; i < rgbMeasured[0]; i++) {
      expect(
        Math.abs(rgbMeasured[0][i] - blackPatchReferenceIMG5248[i]),
      ).toBeLessThan(rgbTolerance);
    }

    for (let i = 0; i < rgbMeasured[rgbMeasured.length - 1]; i++) {
      expect(
        Math.abs(rgbMeasured[rgbMeasured.length - 1][i] - rgbLastPatch[i]),
      ).toBeLessThan(rgbTolerance);
    }

    for (let i = 0; i < rgbMeasured[rgbMeasured.length - 3]; i++) {
      expect(
        Math.abs(rgbMeasured[rgbMeasured.length - 3][i] - rgbMinus3Patch[i]),
      ).toBeLessThan(rgbTolerance);
    }
  });
});
