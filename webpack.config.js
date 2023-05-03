const path = require("path");
const { getConfig } = require("./common");

const publicConfig = env => {
	const production = !!(env && env.production);

	return {
		...getConfig(production, "publicConfig"),
		entry: {
			"roman": [
				"./src/index.ts",
			],
		},
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: `[name].js`,
			libraryTarget: 'window',
			library: "Roman",
		},
	};
};

module.exports = [publicConfig];
