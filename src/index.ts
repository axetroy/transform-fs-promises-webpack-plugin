import BabelPluginTransformFsPromises from "babel-plugin-transform-fs-promises";
import { transformAsync } from "@babel/core";
import type { TransformOptions } from "@babel/core";
import type { Compiler, Compilation } from "webpack";

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
        const { webpack } = compiler;
        this.isWebpack5 = webpack && webpack.version.startsWith("5");

        if (this.isWebpack5) {
            // Webpack 5 逻辑
            this.applyWebpack5(compiler);
        } else {
            // Webpack 4 逻辑
            this.applyWebpack4(compiler);
        }
    }

    /**
     * Webpack 5 实现（使用 processAssets）
     */
    private applyWebpack5(compiler: Compiler) {
        compiler.hooks.thisCompilation.tap("TransformFsPromisesPlugin", (compilation: Compilation) => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: "TransformFsPromisesPlugin",
                    stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                },
                async (assets) => {
                    await this.processAllAssets(compiler, compilation, assets);
                },
            );
        });
    }

    /**
     * Webpack 4 实现（使用 optimize-chunk-assets）
     */
    private applyWebpack4(compiler: Compiler) {
        compiler.hooks.compilation.tap("TransformFsPromisesPlugin", (compilation: Compilation) => {
            // Webpack 4 没有 processAssets，使用 optimizeChunkAssets
            compilation.hooks.optimizeChunkAssets.tapPromise("TransformFsPromisesPlugin", async (chunks) => {
                const assets: Record<string, any> = {};
                chunks.forEach((chunk) => {
                    chunk.files.forEach((file) => {
                        assets[file] = compilation.assets[file];
                    });
                });
                await this.processAllAssets(compiler, compilation, assets);
            });
        });
    }

    /**
     * 处理所有资源（公共方法）
     */
    private async processAllAssets(compiler: Compiler, compilation: Compilation, assets: Record<string, any>): Promise<void> {
        const javascriptFiles = Object.keys(assets).filter((filename) => filename.endsWith(".js"));

        const tasks = javascriptFiles.map(async (filename) => {
            const originalSource = assets[filename].source();
            const sourceStr = typeof originalSource === "string" ? originalSource : originalSource.toString();

            const modifiedSource = await this.replaceContent(sourceStr, filename);

            if (modifiedSource === sourceStr) {
                return;
            }

            // Webpack 4/5 通用的更新资源方式
            if (this.isWebpack5) {
                // 更新资源
                compilation.updateAsset(filename, new compiler.webpack.sources.RawSource(modifiedSource));
            } else {
                // @ts-expect-error
                compilation.assets[filename] = {
                    source: () => modifiedSource,
                    size: () => modifiedSource.length,
                };
            }
        });

        await Promise.all(tasks);
    }

    /**
     * 使用 Babel 转换代码
     */
    private async replaceContent(source: string, filename: string): Promise<string> {
        const result = await transformAsync(source, {
            ...this.transformOptions,
            filename,
            plugins: [...(this.transformOptions.plugins ?? []), BabelPluginTransformFsPromises].filter(Boolean),
        });

        if (!result?.code) {
            throw new Error("Babel transform failed");
        }

        return result.code;
    }
}

export { TransformFsPromisesPlugin };
export default TransformFsPromisesPlugin;
