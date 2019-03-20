import { uglify } from "rollup-plugin-uglify";

import baseConfig from './rollup.base';

const plugins =
  baseConfig.plugins;

const external = baseConfig.external;

const fs = require('fs');
const path = require('path');
const getAbsPath = function() {
  const _args = [].slice.call(arguments);
  return path.join(..._args);
};
const fileArr = [];
const targetDir = path.resolve('src');
getFile(targetDir);
function getFile(targetDir) {
  fs.readdirSync(targetDir).forEach(function(filedir) {
    const filepath = getAbsPath(targetDir, filedir);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      getFile(filepath);
    } else {
      fileArr.push(filepath);
    }
  });
}

export default fileArr
  .map(file => {
    return {
      input: file,
      output: {
        file: file.replace(/src/, 'es'),
        format: 'es'
      },
      plugins,
      external
    };
  })
  .concat(
    fileArr.map(file => {
      return {
        input: file,
        output: {
          file: file.replace(/src/, 'lib'),
          format: 'cjs'
        },
        plugins,
        external
      };
    })
  )
  .concat([
    {
      input: getAbsPath(__dirname, '..', 'lib/index.js'),
      output: {
        file: getAbsPath(__dirname, '..', 'dist/moisten.js'),
        name: 'moisten',
        format: 'umd'
      },
      plugins: plugins.concat([uglify()])
    }
  ]);