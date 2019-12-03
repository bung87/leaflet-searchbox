import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import postcss from '@bung87/rollup-plugin-postcss'
import sprites from '@bung87/postcss-sprites';
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
		external: ['leaflet',"leaflet-geosearch"],
		plugins: [
			json(),
			resolve(),
			commonjs(),
			postcss({
				extract: "dist/style.css",
				plugins: [sprites({
					stylesheetPath: './dist',
					spritePath: './dist/images/',
					retina: true,
					// verbose:true,
					groups: ["2x"],
					ratio: 2
				})]
			}),
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
		external: ['leaflet',"leaflet-geosearch"],
		plugins: [
			json(),
			postcss({

			}),
			resolve(),
			commonjs({ namedExports: { 'node_modules/bean/bean.js': ['bean'] ,'leaflet-geosearch/lib/index.js':["OpenStreetMapProvider"]} }),
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
		external: ['leaflet',"leaflet-geosearch"],
		plugins: [
			json(),
			postcss({

			}),
			resolve(),
			
			commonjs({ namedExports: { 'node_modules/bean/bean.js': ['bean'] ,'leaflet-geosearch/lib/index.js':["OpenStreetMapProvider"]} }),
			
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