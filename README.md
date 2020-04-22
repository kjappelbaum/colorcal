# colorcal

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Calibrate the color of images using a color calibration card.

The approach is semi-automatic. After picking the edges of the color calibration card, the rest should happen automatically.

RGB values copied from
https://github.com/G1teste/antonio/blob/8d91d348d8eb56d6379b5058dda2793a10909dd9/Catalano.Image/src/Catalano/Imaging/Tools/ColorCard.java

Open source implementation of 10.1016/j.isprsjprs.2018.09.015 to be used directly in ELN.

## Installation

`$ npm i colorcal`

## Usage

```js
import library from 'colorcal';

const result = library(args);
// result is ...
```

## [API Documentation](https://cheminfo.github.io/colorcal/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/colorcal.svg
[npm-url]: https://www.npmjs.com/package/colorcal
[ci-image]: https://github.com/cheminfo/colorcal/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/cheminfo/colorcal/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/colorcal.svg
[download-url]: https://www.npmjs.com/package/colorcal
