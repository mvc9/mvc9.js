/*
 *	mvc9 demo - gulpfile.js
 *	http://localhost:1090/
 */

var gulp = require('gulp');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var connect = require('gulp-connect');

//是否执行开发模式编译;=true不会压缩js/css;
var developmentMode = true;
//开发源路径根目录
var examplesSrcBaseDir = "./examples/src";
//项目编译路径根目录
var examplesBuildBaseDir = "./examples/build";

var config = {
    //MVC9 Src
    "mvc9Src": "./src/**/*.*",
    //MVC9 Dist
    "mvc9Dist": "./dist",
    //LESS开发源路径
    "lessSrc": examplesSrcBaseDir + "/**/*.less",
    //LESS编译输出路径
    "lessExport": examplesBuildBaseDir,
    //编译时压缩样式表
    "lessCompress": !developmentMode,
    //JS开发源路径
    "jsSrc": examplesSrcBaseDir + "/**/*.js",
    //JS编译输出路径
    "jsExportDir": examplesBuildBaseDir,
    //编译时压缩JS
    "jsCompress": !developmentMode,
    //HTML5开发源路径
    "htmlSrc": examplesSrcBaseDir + "/**/*.html",
    //HTML5编译路径
    "htmlExportDir": examplesBuildBaseDir,
    //src源路径
    "srcSrc": examplesSrcBaseDir + "/**/*.*",
    //src发布路径
    "srcExportDir": examplesBuildBaseDir,
    //开发环境本地web服务根目录路径
    "webServerRoot": examplesBuildBaseDir,
    //开发环境本地web服务端口
    "webServerPort": "1090"
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

gulp.task('mvc9', function() {
    return gulp.src(config.mvc9Src)
        .pipe(gulp.dest(examplesSrcBaseDir + "/mvc9")) //输出
        .pipe(uglify()) //压缩
        .pipe(gulp.dest(config.mvc9Dist)); //输出
});

gulp.task('watch', function() {
    watch(config.lessSrc, function() { //监视所有less
        gulp.start('less'); //出现修改立即执行less任务
    });
    watch(config.jsSrc, function() { //监视所有js
        gulp.start('js'); //出现修改立即执行js任务
    });
    watch(config.htmlSrc, function() { //监视所有html
        gulp.start('html'); //出现修改立即执行html任务
    });
    watch(config.srcSrc, function() { //监视所有src
        gulp.start('src'); //出现修改立即执行src任务
    });
    watch(config.mvc9Src, function() { //监视根目录源
        gulp.start('mvc9'); //出现修改立即执行js任务
    });
});

gulp.task('webserver', function() { //部署webserver:90
    connect.server({
        "root": config.webServerRoot,
        "port": config.webServerPort
    });
});

gulp.task('default', ['mvc9', 'src', 'less', 'js', 'html', 'watch', 'webserver']);
