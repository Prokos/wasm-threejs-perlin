const webpack = require('webpack');

const config = {
	context: `${__dirname}/src`,
	entry: {
		app: './bootstrap.js',
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['env', 'stage-1'],
				},
			},
			{
				test: /\.wasm$/,
				loaders: ['wasm-loader']
			},
		],
	},
	output: {
		path: `${__dirname}/dist/scripts`,
		filename: '[name].min.js',
	},
	resolve: {
		modules: [`${__dirname}/src`, 'node_modules', `${__dirname}`],
	},
	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin()
	],
};

module.exports = config;
