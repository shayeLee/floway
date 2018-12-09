require("babel-polyfill");

//gulp
var gulp = require("gulp"),
	gulpSequence = require("gulp-sequence"),
	gutil = require("gulp-util"),
	del = require("del"),
	path = require("path"),
	rename = require("gulp-rename"),
	uglify = require("gulp-uglify"),
	postcss = require("gulp-postcss"),
	sass = require("gulp-sass"),
	cached = require("gulp-cached"),
	remember = require("gulp-remember"),
	sourcemaps = require("gulp-sourcemaps"),
	imagemin = require("gulp-imagemin"),
	rollup = require("rollup"),
	json = require("rollup-plugin-json"),
	babel = require("rollup-plugin-babel"),
	css = require("rollup-plugin-css-only"),
	nodeResolve = require("rollup-plugin-node-resolve"),
	commonJs = require("rollup-plugin-commonjs"),
	replace = require("rollup-plugin-replace");

//browser-sync
var bs = require("browser-sync").create();

var src = {
	main: "src/index.js"
};

var dest = {
	main: "dist/rx-samsara.js"
};

var plugins = [
	json(),
	css({ output: "dist/example.css" }),
	replace({
		"process.env.NODE_ENV": JSON.stringify("production")
	}),
	babel({
    runtimeHelpers: true,
		exclude: "node_modules/**"
  })
];

var cjsPlugins = [
	nodeResolve({
		jsnext: true,
		main: true
	}),
	commonJs({
		// non-CommonJS modules will be ignored, but you can also
		// specifically include/exclude files
		include: "node_modules/**", // Default: undefined
		exclude: ["node_modules/nprogress/nprogress.css"], // Default: undefined
		// these values can also be regular expressions
		// include: /node_modules/

		// search for files other than .js files (must already
		// be transpiled by a previous plugin!)
		extensions: [".js", ".coffee"], // Default: [ '.js' ]

		// if true then uses of `global` won't be dealt with by this plugin
		ignoreGlobal: false, // Default: false

		// if false then skip sourceMap generation for CommonJS modules
		sourceMap: false, // Default: true

		// explicitly specify unresolvable named exports
		// (see below for more details)
		namedExports: { "./module.js": ["foo", "bar"] }, // Default: undefined

		// sometimes you have to leave require statements
		// unconverted. Pass an array containing the IDs
		// or a `id => boolean` function. Only use this
		// option if you know what you're doing!
		ignore: ["conditional-runtime-dependency"]
	})
];

var rollupConfig = {
	plugins: []
};

//清除
gulp.task("clean", function(cb) {
	del.sync("dist/");
	cb();
});

gulp.task("rollup-dev", function() {
  rollupConfig.input = "example/index.js";
  rollupConfig.watch = {
    include: ["src/**/", "example/**/*.*", "browser-redis/**/*.*"],
    exclude: "example/react.js"
  }
  rollupConfig.plugins = plugins.concat(cjsPlugins);
  rollupConfig.output = [{
    file: "dist/rx-samsara.umd.js",
    format: "umd",
    sourcemap: true
  }]
  const watcher = rollup.watch(rollupConfig);
  watcher.on('event', event => {
    //   event.code 会是下面其中一个：
    //   START        — 监听器正在启动（重启）
    //   BUNDLE_START — 构建单个文件束
    //   BUNDLE_END   — 完成文件束构建
    //   END          — 完成所有文件束构建
    //   ERROR        — 构建时遇到错误
    //   FATAL        — 遇到无可修复的错误
    console.log(event.code);
    if (event.code === 'FATAL' || event.code === 'ERROR') {
      console.log(event)
    }
  });
});

gulp.task("rollup-pro", function(cb) {
  rollupConfig.input = src.main;
  rollupConfig.plugins = plugins;
	return rollup.rollup(rollupConfig).then(bundle => {
		return bundle.write({
			file: dest.main,
			format: "cjs",
			name: "rx-samsara"
		});
	});
});

gulp.task("dev", gulpSequence("rollup-dev"));
gulp.task("build", gulpSequence("rollup-pro"));
