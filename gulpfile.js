/*
 *	mvc9 demo - gulpfile.js
 *	http://localhost:90/
 */

var gulp = require('gulp');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var connect = require('gulp-connect');

//是否执行开发模式编译;=true不会压缩js/css;
var developmentMode = false;
//开发源路径根目录
var developRoot = "./app_develop";
//编译发布路径根目录
var releaseRoot = "./app_build";

var config = {
	//LESS开发源路径
	"lessSrc": developRoot + "/less_dev/**/*.less",
	//LESS编译输出路径
	"lessExport": releaseRoot + "/stylesheet",
	//编译时压缩样式表
	"lessCompress": !developmentMode,
	//JS开发源路径
	"jsSrc": developRoot + "/js_dev/**/*.js",
	//JS编译输出路径
	"jsExportDir": releaseRoot + "/script",
	//编译时压缩JS
	"jsCompress": !developmentMode,
	//HTML5开发源路径
	"htmlSrc": developRoot + "/html_dev/**/*.html",
	//HTML5编译路径
	"htmlExportDir": releaseRoot + "/html",
	//src源路径
	"srcSrc": developRoot + "/src_dev/**/*.*",
	//src发布路径
	"srcExportDir": releaseRoot + "/src",
	//开发环境本地web服务根目录路径
	"webServerRoot": releaseRoot,
	//开发环境本地web服务端口
	"webServerPort": "90"
}

gulp.task('less', function() {
	if (config.lessCompress) {
		return gulp.src([config.lessSrc]) //less源文件
			.pipe(less()) //执行编译
			.pipe(minifycss()) //压缩CSS
			.pipe(gulp.dest(config.lessExport)) //输出目录
	} else {
		return gulp.src([config.lessSrc])
			.pipe(less())
			.pipe(gulp.dest(config.lessExport))
	}
});

gulp.task('js', function() {
	if (config.jsCompress) {
		return gulp.src(config.jsSrc)
			.pipe(uglify()) //压缩
			.pipe(gulp.dest(config.jsExportDir)); //输出
	} else {
		return gulp.src(config.jsSrc)
			.pipe(gulp.dest(config.jsExportDir));
	}
});

gulp.task('html', function() {
	return gulp.src(config.htmlSrc)
		.pipe(gulp.dest(config.htmlExportDir)); //输出
});

gulp.task('src', function() {
	return gulp.src(config.srcSrc)
		.pipe(gulp.dest(config.srcExportDir)); //输出
});

gulp.task('index', function() {
	return gulp.src(developRoot + '/*.*')
		.pipe(gulp.dest(releaseRoot)); //输出
});

gulp.task('watch', function() {
	watch(config.lessSrc, function() { //监视所有less
		gulp.start('less'); //出现修改立即执行less任务
	});
	watch(config.jsSrc, function() { //监视所有js
		gulp.start('js'); //出现修改立即执行js任务
	});
	watch(config.htmlSrc, function() { //监视所有js
		gulp.start('html'); //出现修改立即执行js任务
	});
	watch(config.srcSrc, function() { //监视所有src
		gulp.start('src'); //出现修改立即执行js任务
	});
	watch(developRoot + '/*.*', function() { //监视根目录源
		gulp.start('index'); //出现修改立即执行js任务
	});
});

gulp.task('webserver', function() { //部署webserver:90
	connect.server({
		"root": config.webServerRoot,
		"port": config.webServerPort
	});
});

gulp.task('default', ['index', 'src', 'less', 'js', 'html', 'watch', 'webserver']);
