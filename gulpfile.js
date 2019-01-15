require("babel-polyfill");

//gulp
var gulp = require("gulp"),
	gulpSequence = require("gulp-sequence"),
  del = require("del"),
  /* gutil = require("gulp-util"),
	path = require("path"),
	rename = require("gulp-rename"),
	uglify = require("gulp-uglify"),
	postcss = require("gulp-postcss"),
	sass = require("gulp-sass"),
	cached = require("gulp-cached"),
	remember = require("gulp-remember"),
	sourcemaps = require("gulp-sourcemaps"),
	imagemin = require("gulp-imagemin"), */
	rollup = require("rollup"),
	// json = require("rollup-plugin-json"),
	babel = require("rollup-plugin-babel"),
	css = require("rollup-plugin-css-only"),
	nodeResolve = require("rollup-plugin-node-resolve"),
	commonJs = require("rollup-plugin-commonjs"),
	// uglify = require("rollup-plugin-uglify").uglify,
	replace = require("rollup-plugin-replace");

//browser-sync
var bs = require("browser-sync").create();

var src = {
	main: "src/index.js"
};

var dest = {
	main: "dist/rx-samsara.js"
};

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
  rollupConfig.plugins = [
		css({ output: "dist/example.css" }),
		replace({
			"process.env.NODE_ENV": JSON.stringify("development")
		}),
		babel({
			runtimeHelpers: true,
			exclude: "node_modules/**"
    }),
    nodeResolve({
      jsnext: true,
      extensions: [ ".js", ".jsx" ]
		}),
		commonJs({
			// non-CommonJS modules will be ignored, but you can also
			// specifically include/exclude files
      // include: "node_modules/**", // Default: undefined
      
      // exclude: ["node_modules/nprogress/nprogress.css"], // Default: undefined
      
			// these values can also be regular expressions
			// include: /node_modules/
	
			// search for files other than .js files (must already
			// be transpiled by a previous plugin!)
			extensions: [".js", ".jsx"],
	
			// if true then uses of `global` won't be dealt with by this plugin
			// ignoreGlobal: false, // Default: false
	
			// if false then skip sourceMap generation for CommonJS modules
			// sourceMap: false, // Default: true
	
			// explicitly specify unresolvable named exports
			// (see below for more details)
			// namedExports: { "./module.js": ["foo", "bar"] }, // Default: undefined
	
			// sometimes you have to leave require statements
			// unconverted. Pass an array containing the IDs
			// or a `id => boolean` function. Only use this
			// option if you know what you're doing!
			// ignore: ["conditional-runtime-dependency"]
		})
	];
  rollupConfig.output = [{
    file: "dist/example.js",
		format: "iife"
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
  rollupConfig.external = function (name) {
    return (
      /rxjs/.test(name) ||
      /react/.test(name) ||
      /react-dom/.test(name) ||
      /js-md5/.test(name) ||
      /nprogress/.test(name) ||
      /shaye-sword/.test(name)
    )
  };
  rollupConfig.plugins = [
		css({ output: "dist/bundle.css" }),
		replace({
			"process.env.NODE_ENV": JSON.stringify("production")
		}),
		babel({
			runtimeHelpers: true,
			exclude: "node_modules/**"
		}),
		nodeResolve({
			jsnext: true,
      extensions: [ ".js", ".jsx" ]
		}),
		commonJs({
			// non-CommonJS modules will be ignored, but you can also
			// specifically include/exclude files
      // include: "node_modules/**", // Default: undefined
      
      // exclude: ["node_modules/nprogress/nprogress.css"], // Default: undefined
      
			// these values can also be regular expressions
			// include: /node_modules/
	
			// search for files other than .js files (must already
			// be transpiled by a previous plugin!)
			extensions: [".js", ".jsx"],
	
			// if true then uses of `global` won't be dealt with by this plugin
			ignoreGlobal: false, // Default: false
	
			// if false then skip sourceMap generation for CommonJS modules
			// sourceMap: false, // Default: true
	
			// explicitly specify unresolvable named exports
			// (see below for more details)
			// namedExports: { "./module.js": ["foo", "bar"] }, // Default: undefined
	
			// sometimes you have to leave require statements
			// unconverted. Pass an array containing the IDs
			// or a `id => boolean` function. Only use this
			// option if you know what you're doing!
			// ignore: ["conditional-runtime-dependency"]
		}),
		/* uglify({
			compress: true
		}) */
	];
	return rollup.rollup(rollupConfig).then(bundle => {
		return bundle.write({
			file: dest.main,
			format: "es",
			name: "rx-samsara"
		});
	});
});
gulp.task("dev", gulpSequence("rollup-dev"));
gulp.task("build", gulpSequence("rollup-pro"));
