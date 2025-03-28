import type { Compiler } from "webpack";
import type { TransformOptions } from "@babel/core";

export interface Options {
    transformOptions?: TransformOptions;
}

declare class TransformFsPromisesPlugin {
    constructor(options?: Options);
    /**
     * Apply the plugin
     */
    apply(compiler: Compiler): void;
}

export { TransformFsPromisesPlugin };
export default TransformFsPromisesPlugin;
