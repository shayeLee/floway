import replace from "rollup-plugin-replace";
import sass from 'rollup-plugin-sass';
import baseConfig from "./rollup.base";

/**
 * todoList
*/
const exampleName = "todoList";

const plugins = baseConfig.plugins.slice().concat([sass({
  insert: true
})]);
plugins.splice(
  0,
  1,
  replace({
    "process.env.NODE_ENV": JSON.stringify("development")
  })
);

export default {
  input: `docs/example/${exampleName}/src/index.js`,
  watch: {
    include: ["src/**", "docs/example/**"],
    exclude: "node_modules/**"
  },
  output: {
    file: `docs/example/${exampleName}/bundle.js`,
    name: "moisten",
    sourcemap: true,
    format: "iife"
  },
  plugins,
  onwarn (warning) {
    // 跳过某些警告
    if (warning.code === "EVAL") return;
  
    // 抛出异常
    // if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);
  
    // 控制台打印一切警告
    console.warn(warning.message);
  }
}
