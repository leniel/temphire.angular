const webpack = require('webpack');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = function (env) {
    return Merge(CommonConfig, {

        entry: {
            'app': './app/main.ts',
            'vendor': [
                'tslib',
                'lodash-es',
                'rxjs',
                'breeze-client',
                'breeze-client/adapters/adapter-data-service-webapi.umd',
                'breeze-client/adapters/adapter-model-library-backing-store.umd',
                'breeze-client/adapters/adapter-uri-builder-json.umd',
                'breeze-client/adapters/adapter-uri-builder-odata.umd',
                'breeze-bridge2-angular',
                '@angular/common',
                '@angular/compiler',
                '@angular/core',
                '@angular/forms',
                '@angular/platform-browser-dynamic',
                '@angular/router'
            ],
        },

        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loaders: ['ts-loader', 'angular2-template-loader'],
                    exclude: [/node_modules/]
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader?attrs=false&-removeAttributeQuotes&caseSensitive'
                }
            ]
        },

        plugins: [

            new CommonsChunkPlugin({
                name: ['app', 'vendor']
            }),
            new CommonsChunkPlugin({
                name: 'manifest',
                minChunks: Infinity
            })
        ]
    });
}