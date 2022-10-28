let mix = require('laravel-mix');
mix.js('resources/js/app.js', 'public/js')
   .webpackConfig({
        node: {
          fs: 'empty'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['*', '.js', '.jsx', '.vue', '.ts', '.tsx'],
        },
    });
