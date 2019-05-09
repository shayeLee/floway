import babel from "rollup-plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";

const extensions = [
  '.js', '.jsx', '.ts', '.tsx',
];

export default {
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    babel({
      extensions,
      runtimeHelpers: true,
      exclude: "node_modules/**"
    }),
    nodeResolve({
      extensions,
      jsnext: true
    }),
    commonjs({
      extensions,
      ignoreGlobal: false
    })
  ],
  external: function(name) {
    return (
      /@babel\/runtime/.test(name) ||
      /prop-types/.test(name) ||
      /rxjs/.test(name) ||
      /react/.test(name) ||
      /react-dom/.test(name) ||
      /src/.test(name)
    );
  }
}