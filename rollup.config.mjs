import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import polyNode from "rollup-plugin-polyfill-node";
import typescript from "@rollup/plugin-typescript";
import tsconfig from "./tsconfig.json" with { type: "json" };
import { defineConfig } from "rollup";
import ts from "typescript";
import keywordTransform from "./src/plugins/keyword-transform.mjs";
import varTransform from "./src/plugins/var-transform.mjs";
import globalTransform from "./src/plugins/global-transform.mjs"
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default defineConfig([
	{
		input: "src/main.ts",
		output: {
			file: `${process.env.HOME}/Desktop/ART/Animation/zzz-sandbox/sandbox1/scripts/bundle.js`,
			format: "esm", // immediately-invoked function expression — suitable for <script> tags
			sourcemap: false,
			preserveModules: false,
			interop:"esModule",
			exports: "named",
		},
		plugins: [
			resolve({ preferBuiltins: false, browser: true}),
			commonjs({ extensions: [".js", ".ts"] }),
			typescript({
				transformers: {
					before: [
						// Or even define in place
						{
							type: "program",
							factory: (prog) =>
								function (context) {
									// console.log(context);
									var trans = (source) => {
										function visitor(node) {
											// Do real work here

											if (ts.isVariableDeclarationList(node)) {
												// node.get
												/* console.log(
													node.declarations.map((x) => x.name.escapedText)
												); */
												return ts.factory.createVariableDeclarationList(
													node.declarations,
													ts.NodeFlags.None
												);
											}
											return ts.visitEachChild(node, visitor, context);
										}

										return ts.visitNode(source, visitor);
									};
									return {
										transformBundle: trans,
										transformSourceFile: trans,
									};
								},
						},
						{
							type: "program",
							factory: (prog) =>
								function (ctx) {
									var trans = (source) => {
										function visitor(node) {
											if (ts.isVariableDeclaration(node)) {
												if (node.name.escapedText == "INVALID_BASE64_RE") {
													var init = ts.factory.createNewExpression(
														ts.factory.createIdentifier("RegExp"),
														undefined,
														[
															ts.factory.createStringLiteral(
																node.initializer.text
																	.replace(/^\//, "")
																	.replace("/g", "")
															),
														]
													);
													// console.log(node.initializer)
													return ts.factory.updateVariableDeclaration(
														node,
														node.name,
														node.exclamationToken,
														node.type,
														init
													);
												}
											}
											return ts.visitEachChild(node, visitor, ctx);
										}
										return ts.visitNode(source, visitor);
									};
									let noop = (n) => ts.visitEachChild(n, noop, ctx);
									return {
										transformBundle: trans,
										transformSourceFile: trans,
									};
								},
						},
					],
					after: [],
				},
				allowJs: true,
				allowSyntheticDefaultImports: true,
				esModuleInterop: true,
				// compilerOptions: tsconfig.compilerOptions,
				include: [
					"src/**/*.ts",
					// "node_modules/buffer/*.js",
					// "node_modules/buffer/*.ts",
					"node_modules/core-js/full/**/*.js",
					"node_modules/core-js/full/object/*.js",
					"node_modules/core-js/full/typed-array/*.js",
					"node_modules/core-js/full/array/*.js",
					// "node_modules/typed-array/*.js",
					"node_modules/form-urlencoded/*.*js",
				],
				// exclude: ["node_modules/core-js/full/object/*.js"],
				compilerOptions: {
					...tsconfig.compilerOptions,
				},
			}),
			polyNode({
				include: ["buffer"],
				exclude: ["crypto"]
			}),
			// tells Rollup how to find date-fns in node_modules
		],
		treeshake: false,
	},
	{
		output: {
			file: `${process.env.HOME}/Desktop/ART/Animation/zzz-sandbox/sandbox1/scripts/bundle.js`,
			sourcemap: false,
			preserveModules: false,
			interop: "auto",
			exports: "named",
			format: "iife"
		},
		context: "this",
		treeshake: false,
		input: `${process.env.HOME}/Desktop/ART/Animation/zzz-sandbox/sandbox1/scripts/bundle.js`,
		plugins: [keywordTransform(), varTransform(), globalTransform()],
	},
]);
