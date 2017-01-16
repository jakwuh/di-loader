import {name as packageName} from '../package.json';
import parseDefinitionsPlugin from './plugins/parseDefinitions';
import prefetchDependenciesPlugin from './plugins/prefetchDependencies';
import extractDependenciesPlugin from './plugins/extractDependencies';
import {Scanner} from './Scanner';

export default class DILoaderPlugin {

    /**
     * @param {string|string[]} options.src
     * @param {string} [options.exportName]
     * @param {string[]} [options.extensions]
     * @param {function(path)} [options.filter]
     */
    constructor(options = {}) {
        Object.assign(this, {
            filter: () => true,
            extensions: ['.js', '.jsx'],
            exportName: '__diDefinitions'
        }, options);

        this.dependencies = {};
        this.resolvers = {};
    }

    apply(compiler) {
        let loaderOptions = compiler.options.resolveLoader;

        Object.assign(loaderOptions.alias || (loaderOptions.alias = {}), {
            [`${packageName}/dependencies`]: `${packageName}/lib/loaders/dependencies`,
            [`${packageName}/resolvers`]: `${packageName}/lib/loaders/resolvers`,
            [`${packageName}/container`]: `${packageName}/lib/loaders/container`
        });

        this.paths = new Scanner({extensions: this.extensions, filter: this.filter})
            .scanDirectories([].concat(this.src))
            .getPaths()
            .filter(this.filter);

        this.prefetchedPaths = new Map();

        compiler.plugin('make', extractDependenciesPlugin.bind(this));
        compiler.plugin('compilation', (compilation, data) => {
            prefetchDependenciesPlugin.call(this, compilation, data);
            data.normalModuleFactory.plugin('parser', (parser, options) => {
                parser.plugin('call Object.defineProperty', parseDefinitionsPlugin.bind(this));
            });
        });
    }

}
