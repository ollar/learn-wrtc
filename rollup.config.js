import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import inject from 'rollup-plugin-inject';
import path from 'path';


export default {
  input: 'src/index.js',
  output: {
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js',
    sourcemap: true,
  },
  plugins: [
    filesize(),
    resolve({
        jsnext: true,
    }),
    commonjs({
      include: 'node_modules/**',
      ignore: ['jquery'],
    }),
    inject({
      modules: {
        '_': 'underscore',
        Backbone: path.resolve( 'src/backbone.config.js'),
      },
    }),
  ]
};
