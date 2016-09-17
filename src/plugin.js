import {name as packageName} from '../package.json';
import parseDefinitionsPlugin from './plugins/parseDefinitions';
import prefetchDependenciesPlugin from './plugins/prefetchDependencies';
import extractDependenciesPlugin from './plugins/extractDependencies';

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
        Object.assign(compiler.options.resolveLoader.alias, {
            [`${packageName}/dependencies`]: `${packageName}/lib/loaders/dependencies`,
            [`${packageName}/resolvers`]: `${packageName}/lib/loaders/resolvers`,
            [`${packageName}/container`]: `${packageName}/lib/loaders/container`
        });

        compiler.parser.plugin('call Object.defineProperty', parseDefinitionsPlugin.bind(this));
        compiler.plugin('compilation', prefetchDependenciesPlugin.bind(this));
        compiler.plugin('make', extractDependenciesPlugin.bind(this));
    }

}
