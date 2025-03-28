import test from "node:test";
import path from "node:path";
import fs from "node:fs";
import webpack from "webpack4";
import { createFsFromVolume, Volume } from "memfs3";
import { Union } from "unionfs2";

import TransformFsPromisesPlugin from "../../src/index";

async function compile(input: string, options = {}) {
    const compiler = webpack({
        mode: "none",
        target: "node",
        context: path.resolve(__dirname, "fixtures"),
        entry: input,
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "bundle.js",
        },
        plugins: [new TransformFsPromisesPlugin()],
        ...options,
    });

    const outputFileSystem = createFsFromVolume(new Volume());
    // @ts-expect-error polyfill the join method that webpack4 need
    outputFileSystem.join = path.join
    const inputFileSystem = new Union();
    inputFileSystem.use(fs).use(new Volume());

    compiler.outputFileSystem = outputFileSystem;
    compiler.inputFileSystem = inputFileSystem;
    compiler.resolverFactory.hooks.resolveOptions.for("normal").tap("TransformFsPromisesPlugin", (resolveOptions) => {
        resolveOptions.fileSystem = inputFileSystem;
        return resolveOptions;
    });

    /**
     * @type {import('webpack').Stats}
     */
    const _stats = await new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });

    const bundlePath = path.resolve(__dirname, "dist", "bundle.js");
    const content = await outputFileSystem.promises.readFile(bundlePath, "utf8");

    return content;
}

test("webpack4 - TransformFsPromisesPlugin: build cjs", async (t) => {
    const content = await compile("./index.cjs");

    t.assert.snapshot(content, {
        serializers: [(value) => value],
    });
});

test("webpack4 - TransformFsPromisesPlugin: build esm", async (t) => {
    const content = await compile("./index.mjs");

    t.assert.snapshot(content, {
        serializers: [(value) => value],
    });
});
