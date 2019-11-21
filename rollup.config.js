import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import postcss from 'rollup-plugin-postcss'
import sprites from 'postcss-sprites';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json'
// import plugin from 'scss-in-dom/lib/rollup-plugin'
export default [

	// browser-friendly UMD build
	{
		input: 'src/bundle.js',
		output: {
			name: 'L.Control.SearchBox',
			globals: {
				'leaflet': 'L',
				'bean': 'bean'
			},
			file: pkg.browser,
			format: 'umd'
		},
		external: ['leaflet'],
		plugins: [
			json(),
			postcss({
				extract: "dist/style.css",
				plugins: [sprites({
					stylesheetPath: './dist',
					spritePath: './dist/images/',
					retina: true,
					groups: ["2x"],
					ratio: 2
				})]
			}),
			resolve(),
			commonjs(),
			babel({
				babelrc:false,
				exclude: "node_modules/**",
				"presets": [
					["@babel/preset-env", {
						useBuiltIns: "usage",
    					corejs: 3, // or 2,
						"targets": {
							"browsers": ["last 2 Chrome versions"]
						}
					}]
				],
			})
		]
	},
	{
		input: 'src/index.js',
		external: ['leaflet'],
		plugins: [
			json(),
			postcss({

			}),
			resolve(),
			commonjs({ namedExports: { 'node_modules/bean/bean.js': ['bean'] } }),
			babel({
				
				exclude: "node_modules/**",
				"presets": [
					[
						"@babel/preset-env",
						{
							"targets": {
								"node": true
							}
						}
					]
				]
			})

		],
		output: [
			{ file: pkg.main, format: 'cjs' },
		]
	},
	{
		input: 'src/index.js',
		external: ['leaflet'],
		plugins: [
			json(),
			postcss({

			}),
			resolve(),
			
			commonjs({ namedExports: { 'node_modules/bean/bean.js': ['bean'] } }),
			
			babel({
				exclude: "node_modules/**",
				"presets": [
					[
						"@babel/preset-env",
						{
							"targets": {
								"esmodules": true
							}
						}
					]
				]
			}),
			// plugin(),

		],
		output: [
			{ file: pkg.module, format: 'es' }
		]
	}
];