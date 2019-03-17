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
    })
  ],
  external: function(name) {
    return (
      /core-js/.test(name) ||
      /prop-types/.test(name) ||
      /rxjs/.test(name) ||
      /react/.test(name) ||
      /react-dom/.test(name) ||
      /js-md5/.test(name) ||
      /async-validator/.test(name) ||
      /shaye-sword/.test(name) ||
      /src/.test(name)
    );
  }
}