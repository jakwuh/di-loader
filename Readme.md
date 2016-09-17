# di-loader

Dependency Injection webpack bundler

## Installation

```bash
npm i -S di-loader
```

## Usage

First add plugin to the list of webpack's plugins.  

```js
// webpack.config.js
const ExtractDIPlugin = require('extract-di-webpack-plugin');

module.exports = {
    // ...
    plugins: [
        // ...
        new DILoaderPlugin({
            src: [
                './src/js/collections',
                './src/js/components',
                './src/js/models',
                './src/js/states'
            ],
            filter(filepath) {
                return !~filepath.indexOf('Spec');
            }
        }),
    ]

 }

```

After that you can use suitable loaders to access `dependencies`, `resolvers` and `container`.  

```js
// entry.js
import dependencies from 'di-loader/dependencies!./client'; // dependencies hashmap
import resolvers from 'di-loader/resolvers!./client'; // resolvers hashmap
import resolvers from 'di-loader/container!./client'; // configured di container
```
