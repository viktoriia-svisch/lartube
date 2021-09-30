let mix = require('laravel-mix');
mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css').webpackConfig({
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
    module.exports = {
      module: {
        loaders: [
          { test: /jquery-mousewheel/, loader: "imports?define=>false&this=>window" },
          { test: /malihu-custom-scrollbar-plugin/, loader: "imports?define=>false&this=>window" }
        ]
      }
    };
