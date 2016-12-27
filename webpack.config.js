var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

// 开发目录中js文件的目录
var srcDir = path.resolve(process.cwd(), 'dev');

//获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
    // js 入口文件
    var jsPath = path.resolve(srcDir, 'js/entry');
    var dirs = fs.readdirSync(jsPath);
    var matchs = [],
        files = {};

    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        console.log(matchs);

        if (matchs) {
            files[matchs[1]] = path.resolve(srcDir, 'js/entry', item);
        }
    });

    console.log(JSON.stringify(files));

    return files;
}

module.exports = {
    cache: true,
    // devtool: 'source-map',
    entry: getEntry(),
    output: {
        path: path.join(__dirname, 'res/js/'),
        publicPath: 'res/js/',
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
    },
    resolve: {
        // 配置别名，在项目中可缩减引用路径
        alias: {
            // jquery 使用script引入
            // jquery: srcDir + "/js/lib/jquery.min.js",
            // 模块入口
            module: srcDir + '/js/module',
            // 业务js入口
            entry: srcDir + '/js/entry'
        }
    },
    plugins: [
        // 将公共代码抽离出来合并为一个文件
        new CommonsChunkPlugin('common.js'),
        // js文件的压缩
        new uglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};