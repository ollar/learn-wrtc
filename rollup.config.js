import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';


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
    }),
  ]
};
