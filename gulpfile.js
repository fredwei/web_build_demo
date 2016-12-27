// 引入gulp
var gulp = require('gulp');

// 判断系统环境
var os = require('os');

// 启动本地服务
var connect = require('gulp-connect');

// 打开浏览器
var gulpOpen = require('gulp-open');

// 同步执行任务
var runSequence = require('run-sequence');

// 重命名
var rename = require('gulp-rename');

// 清理
var clean = require('gulp-clean');

// 图片压缩
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');

// html 处理
var fileinclude = require('gulp-file-include');

// css 处理
var sass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var spriter = require('gulp-css-spriter');
var autoprefixer = require('gulp-autoprefixer');

// js 处理
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var babel = require('gulp-babel');

// md5
var md5 = require('gulp-md5-plus');

// 监听文件变动
var watch = require('gulp-watch');


// 清理生成目录
gulp.task('clean', function (done) {
    gulp.src(['res'])
        .pipe(clean())
        .on('end', done);
});

/*
*
*   图片 相关处理
*
*/

// 图片处理
gulp.task('imagemin', function (done) {
    gulp.src(['dev/images/**/*'])
    // 图片压缩
    .pipe(imagemin())
    .pipe(gulp.dest('res/images'))
    // 生成webp
    .pipe(webp())
    .pipe(gulp.dest('res/webp'))
    .on('end', done);
});


/*
*
*   css 相关处理
*
*/

// 处理scss
gulp.task('scss', function (done) {
    var timestamp = +new Date();

    gulp.src('dev/css/**/*.scss')
    .pipe(sass().on('error', sass.logError))

    // 雪碧图操作
    .pipe(spriter({
        // 保存路径及文件名
        spriteSheet: 'res/images/'+ timestamp +'.png',
        // css文件中雪碧图的路径，最好使用长地址
        pathToSpriteSheetFromCSS: '/images/'+ timestamp +'.png',
        // 雪碧图中图标的间距
        spritesmithOptions: {
            padding: 10
        }
    }).on('log', function(message) {
        console.log(message);
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('res/css'))
    .pipe(connect.reload())
    .on('end', done);
});

// css 压缩 + md5 --- 发布生产环境时调用
gulp.task('md5:css', ['scss'], function (done) {
    gulp.src('res/css/**/*.css')
    .pipe(cssmin())
    .pipe(md5(10, 'res/html/**/*.html'))
    .pipe(gulp.dest('res/css'))
    .pipe(connect.reload())
    .on('end', done);
});


/*
*
*   js 相关处理
*
*/

//引用webpack对js进行操作
gulp.task('buildJs', function(done) {
    var myDevConfig = Object.create(webpackConfig);
    var devCompiler = webpack(myDevConfig);

    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError('webpack:build-js', err);

        gutil.log('[webpack:build-js]', stats.toString({
            colors: true
        }));

        done();
    });
});

// 用于处理es6
gulp.task('babelJs', ['buildJs'], function (done) {
    gulp.src('res/js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('res/js'))
        .pipe(connect.reload())
        .on('end', done);
});


// 将js加上10位md5, 并修改html中的引用路径，该动作依赖buildJs
// --- 发布生产环境时调用
gulp.task('md5:js', ['babelJs'], function (done) {
    gulp.src('res/js/**/*.js')
        .pipe(md5(10, 'res/html/**/*.html'))
        .pipe(gulp.dest('res/js'))
        .pipe(connect.reload())
        .on('end', done);
});



/*
*
*   html 相关处理
*
*/


// 用于在html文件中直接include引入html模块
gulp.task('fileinclude', function (done) {
    gulp.src(['dev/html/**/*.html'])
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(gulp.dest('res/html/'))
        .pipe(connect.reload())
        .on('end', done);
});




/*
*
*   本地服务 相关处理
*
*/


// 判断运行平台
var _pf = os.platform(),
    _browser = (_pf === 'linux' || _pf === 'darwin') ? 'Google chrome' : (
	_pf === 'win32' ? 'chrome' : 'firefox');

// 起始路径、端口及首页
var host = {
    path: 'res/',
    port: 3000,
    html: 'index.html'
};

// 启动本地服务器
gulp.task('connect', function () {
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true
    });
});

// 打开浏览器
gulp.task('open', function (done) {
    gulp.src('')
        .pipe(gulpOpen({
            app: _browser,
            uri: 'http://localhost:'+ host.port +'/html/home/' + host.html
        }))
        .on('end', done);
});

// 监听文件变动
gulp.task('watch', function (done) {
    gulp.watch('dev/css/**/*', ['scss']);
    gulp.watch('dev/js/**/*', ['babelJs']);
    gulp.watch('dev/html/**/*', ['fileinclude']);

    done();
});





/*
*
*   gulp 处理命令
*
*/



//发布
gulp.task('default', function(callback) {
    runSequence(
        'imagemin',
        'fileinclude',
        'md5:css',
        'md5:js',
        'connect',
        'watch',
        'open',
        callback
    );
});


//开发
gulp.task('dev', function(callback) {
    runSequence(
        'imagemin',
        'fileinclude',
        'scss',
        'babelJs',
        'connect',
        'watch',
        'open',
        callback
    );
});

// 模块测试
gulp.task('test', function(callback) {
    runSequence(
        'imagemin',
        'fileinclude',
        'scss',
        'babelJs',
        // 'connect',
        // 'watch',
        // 'open',
        callback
    );
});