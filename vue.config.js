const { defineConfig } = require('@vue/cli-service');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

module.exports = defineConfig({
  devServer: {
    https: {
      key: fs.readFileSync('./ssl/encuestas.tiendasdaka.com.key'),
      cert: fs.readFileSync('./ssl/encuestas.tiendasdaka.com.crt'),
    }
  },
  configureWebpack: {
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: false, // Elimina los console.log en producción
            },
          },
        }),
      ],
    },
    plugins: [
       new webpack.DefinePlugin({
        // Vue CLI is in maintenance mode, and probably won't merge my PR to fix this in their tooling
        // https://github.com/vuejs/vue-cli/pull/7443
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      })
    ],
  },
  css: {
    extract: true, // Extrae el CSS en archivos separados
    sourceMap: false, // Desactiva los mapas de fuente para CSS
  },
  productionSourceMap: false, // Desactiva los mapas de fuente para JS
});
