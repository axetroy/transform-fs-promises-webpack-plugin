import { babelPluginTransformFsPromises } from "babel-plugin-transform-fs-promises";
import BabelTransformPlugin from "babel-transform-webpack-plugin";
import type { TransformOptions } from "@babel/core";
import type { Compiler } from "webpack";

/**
 * 将 fs.promises 替换为 fs 以兼容低版本 Node.js
 * 兼容 Webpack 4 和 Webpack 5
 */
class TransformFsPromisesPlugin {
    isWebpack5 = false;

    transformOptions: TransformOptions;

    constructor({ transformOptions = {} } = {}) {
        this.transformOptions = transformOptions || {};
    }

    apply(compiler: Compiler) {
        new BabelTransformPlugin({
            ...this.transformOptions,
            transformOptions: {
                plugins: ([babelPluginTransformFsPromises] as TransformOptions["plugins"])
                    .concat(this.transformOptions.plugins ?? [])
                    .filter(Boolean),
            },
        }).apply(compiler);
    }
}

export { TransformFsPromisesPlugin };
export default TransformFsPromisesPlugin;
