const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const coresCount = Math.min(require("os").cpus().length, 4);

function getConfig(production, cacheName) {
	const babelLoader = {
		loader: "babel-loader",
		options: {
			presets: [
				[
					"@babel/preset-env",
					{
						modules: false,
						useBuiltIns: "usage",
						corejs: "3",
						browserslistEnv: "modern",
					},
				],
				"@babel/preset-typescript",
			],
			plugins: [
				"@babel/plugin-proposal-class-properties",
				"@babel/plugin-proposal-object-rest-spread",
				"@babel/plugin-syntax-dynamic-import",
				"@babel/plugin-proposal-private-methods",
			],
		},
	};
	const plugins = [
		...production
			? [
				new ESLintPlugin({
					threads: coresCount,
					extensions: ["ts"],
				}),
			]
			: [
				new ESLintPlugin({
					extensions: ["ts"],
				}),
			],
	];

	return {
		mode: production ? "production" : "development",
		//devtool: production ? "source-map" : "inline-cheap-source-map",
		module: {
			rules: [
				{
					test: /\.less$/u, // .less and .css
					use: [
						{
							loader: "style-loader",
						},
						{
							loader: "css-loader",
						},
						"less-loader",
					],
				},
				{
					test: /\.(ts|js)x?$/u,
					//include: /js\/\src/u,
					exclude: /node_modules\/(?!flatpickr)/u,
					use: babelLoader,
				},
				{
					test: /\.(png|svg|jpg|gif)$/u,
					use: [
						{
							loader: 'url-loader',
						},
					],
				}
			],
		},
		resolve: {
			extensions: [
				".ts",
				".tsx",
				".js",
				".jsx",
				".mjs",
			],
			alias: {
				"~": path.resolve(__dirname, "src"),
			},
		},
		plugins,
		optimization: {
			splitChunks: {
				minSize: 100000000,
			},
			...production
				? {
					minimizer: [
						new TerserPlugin({
							parallel: true,
						}),
						new CssMinimizerPlugin(),
					],
				}
				: {},
		},
		...process.env.WATCH_MODE
			? {
				cache: {
					type: "memory",
					maxGenerations: Infinity,
				},
			}
			: {
				cache: {
					type: "filesystem",
					cacheDirectory: path.resolve(__dirname, `.temp_cache-${cacheName}`),
				},
			},
	};
}

module.exports = { getConfig };
