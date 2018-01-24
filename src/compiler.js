/* eslint-disable
import/order,
no-param-reassign
*/
import del from 'del';
import path from 'path';
import MemoryFS from 'memory-fs';
import webpack from 'webpack';
import { version } from 'webpack/package.json';

const mode = (config) => {
  if (Number(version[0]) >= 4) {
    config.mode = config.mode || 'development';
  }

  return config;
};

const optimize = (config) => {
  if (Number(version[0]) >= 4) {
    config.optimization = config.optimization || {
      namedChunks: true,
      namedModules: true,
      runtimeChunk: true,
      occurrenceOrder: true,
    };
  }

  return config;
};

const modules = (config) => {
  return {
    rules: config.rules
      ? config.rules
      : config.loader
        ? [
            {
              test: config.loader.test || /\.txt$/,
              use: {
                loader: path.resolve(process.cwd(), 'src'),
                options: config.loader.options || {},
              },
            },
          ]
        : [],
  };
};

const plugins = (config) =>
  [
    Number(version[0]) >= 4
      ? false
      : new webpack.optimize.CommonsChunkPlugin({
          names: ['runtime'],
          minChunks: Infinity,
        }),
  ]
    .concat(config.plugins || [])
    .filter(Boolean);

const output = (config) => {
  return {
    path: path.resolve(
      process.cwd(),
      `test/outputs/${config.output ? config.output : ''}`
    ),
    // publicPath: 'assets/',
    filename: '[name].js',
    chunkFilename: '[name].js',
  };
};

export default function(fixture, config, options) {
  // Compiler Config
  config = {
    devtool: config.devtool || false,
    context: config.context || path.resolve(process.cwd(), 'test/fixtures'),
    entry: config.entry || `./${fixture}`,
    output: output(config),
    module: modules(config),
    plugins: plugins(config),
  };
  
  // Compiler Mode
  config = mode(config);

  // Compiler Optimizations
  config = optimize(config);

  // Compiler Options
  options = Object.assign({ output: false }, options);

  if (options.output) {
    del.sync(config.output.path);
  }

  const compiler = webpack(config);

  if (!options.output) {
    compiler.outputFileSystem = new MemoryFS();
  }

  return new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve(stats);
    })
  );
}
