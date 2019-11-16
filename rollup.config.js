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
	groups:["2x"],
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
				'leaflet': 'L',
				'bean':'bean'
			},
			file: pkg.browser,
			format: 'umd'
		},
		external: ['leaflet'],
		plugins: [

			resolve(), 
			commonjs(), 
			babel({
				"presets": [
					["@babel/preset-env"]
				],
			})
		]
	},
	{
		input: 'src/index.js',
		external: ['leaflet'],
		plugins: [
			
			resolve(), // so Rollup can find `ms`
			commonjs({namedExports: { 'node_modules/bean/bean.js': ['bean' ] }}), 
			babel({
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
			// { file: pkg.module, format: 'es' }
		]
	},
	{
		input: 'src/index.js',
		external: ['leaflet'],
		plugins: [
			
			resolve(), // so Rollup can find `ms`
			commonjs({namedExports: { 'node_modules/bean/bean.js': ['bean' ] }}), 
			babel({
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
			  })
			
		],
		output: [
			// { file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];