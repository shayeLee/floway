// import typescript from 'rollup-plugin-typescript2';
import babel from "rollup-plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";

export default {
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    babel({
      runtimeHelpers: true,
      exclude: "node_modules/**"
    }),
    nodeResolve({
      jsnext: true
    }),
    commonjs({
      extensions: [".js", ".jsx"],
      ignoreGlobal: false
    }),
    // typescript()
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