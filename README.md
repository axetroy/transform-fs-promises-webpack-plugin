# transform-fs-promises-webpack-plugin

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/transform-fs-promises-webpack-plugin.svg)](https://badge.fury.io/js/transform-fs-promises-webpack-plugin)

A Webpack plugin to transform `require('fs/promises')` to `require('fs').promises` for compatible with Node.js 14 and below.

Compatible with `webpack@5` and `webpack@4`.

## Installation

```bash
npm install transform-fs-promises-webpack-plugin --save
```

## Usage

```js
// import via esm
import { TransformFsPromisesPlugin } from "transform-fs-promises-webpack-plugin";

// import via cjs
const { TransformFsPromisesPlugin } = require("transform-fs-promises-webpack-plugin");
```

```js
const { TransformFsPromisesPlugin } = require("transform-fs-promises-webpack-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
    plugins: [new TransformFsPromisesPlugin()],
};
```

## License

The [Anti 996 License](LICENSE)
