const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');

const fs = require('fs')
const glob = require('glob')

const createMenuJson = function (filesPath) {
    let files = glob.sync(filesPath)
    let obj = {}
    let filePath, basename, extname

    for (let i = 0; i < files.length; i++) {
        filePath = files[i]
        extname = path.extname(filePath)
        basename = path.basename(filePath, extname)
        obj[basename] = path.resolve(fs.realpathSync(process.cwd()), filePath)
    }

    console.log(files)
    console.log(obj)

    return JSON.stringify(obj)
}

module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "js/tsmap.js",
        libraryTarget: "umd"
    },
    mode: "development",
    devtool:false,
    devServer: {
        contentBase: path.join(__dirname, "../dist"),
        host: 'localhost',
        port: '8888',
        inline: true,//webpack官方推荐
        watchOptions: {
            aggregateTimeout: 2000,//浏览器延迟多少秒更新
            poll: 1000//每秒检查一次变动
        },
        compress: true,//一切服务都启用gzip 压缩
        historyApiFallback: true,//找不到页面默认跳index.html
        hot: true,//启动热更新，必须搭配new webpack.HotModuleReplacementPlugin()插件
        open: true,
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: "static/map.html",
            title: 'index',
            inject: true
        }),
        /*new JavaScriptObfuscator({
            compact: true,//压缩代码
            controlFlowFlattening: false,//是否启用控制流扁平化(降低1.5倍的运行速度)
            debugProtection: true,//此选项几乎不可能使用开发者工具的控制台选项卡
            //debugProtectionInterval: true,//如果选中，则会在“控制台”选项卡上使用间隔强制调试模式，从而更难使用“开发人员工具”的其他功能。
            disableConsoleOutput: true,//通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。
            identifierNamesGenerator: 'hexadecimal',//标识符的混淆方式 hexadecimal(十六进制) mangled(短标识符)
            log: false,
            renameGlobals: false,//是否启用全局变量和函数名称的混淆
            rotateStringArray: true,//通过固定和随机（在代码混淆时生成）的位置移动数组。这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。
            selfDefending: true,//混淆后的代码,不能使用代码美化,同时需要配置 cpmpat:true;
            stringArray: true,//删除字符串文字并将它们放在一个特殊的数组中
            //stringArrayEncoding: 'base64',
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: false//允许启用/禁用字符串转换为unicode转义序列。Unicode转义序列大大增加了代码大小，并且可以轻松地将字符串恢复为原始视图。建议仅对小型源代码启用此选项。

        }, []),*/// 数组内是需要排除的文件
    ],
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[ext]',
                            limit: 18192,
                            outputPath: './img',
                            publicPath: './img'
                        }

                    }
                ]
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }

};


