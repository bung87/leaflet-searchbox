import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
// import postcss from 'rollup-plugin-postcss'
import fs from 'fs';
import sprites from 'postcss-sprites';
import babel from 'rollup-plugin-babel';

var postcss = require('postcss');

const opts = {
	stylesheetPath: './dist',
	spritePath: './dist/images/',
	retina: true,
	ratio: 2
};

var css = fs.readFileSync('./src/style.css', 'utf8');
postcss([sprites(opts)])
	.process(css, {
		from: './src/style.css',
		to: './dist/style.css'
	})
	.then(function (result) {
		fs.writeFileSync('./dist/style.css', result.css);
	});

export default [

	// browser-friendly UMD build
	{
		input: 'src/index.js',
		output: {
			name: 'L.Control.SearchBox',
			globals: {
				'leaflet': 'L'
			},
			file: pkg.browser,
			format: 'umd'
		},
		external: ['leaflet'],
		plugins: [
			babel({
				runtimeHelpers: true,
				"presets": ["@babel/preset-env"],
				"plugins": ["@babel/plugin-proposal-object-rest-spread",["fast-async", {
					"runtimePattern": null,
					"useRuntimeModule": true
				  }]],
				exclude: 'node_modules/**'
			}),
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input: 'src/index.js',
		external: ['leaflet'],
		plugins: [
			babel({
				runtimeHelpers: true,
				"presets": ["@babel/preset-env"],
				"plugins": ["@babel/plugin-proposal-object-rest-spread",["fast-async", {
					"runtimePattern": null,
					"useRuntimeModule": true
				  }]],
				exclude: 'node_modules/**'
			}),
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];