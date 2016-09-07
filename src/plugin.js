import PrefetchDependency from 'webpack/lib/dependencies/PrefetchDependency';
import {parseObjectAST, extractClassNameFromModule} from './utils';
import {name as packageName} from '../package.json';
import {Scanner} from './Scanner';
import async from 'async';
import path from 'path';
import {normalizeDefinitions} from 'di.js';
import {uniq} from './utils';

const TYPES = {
    MemberExpression: 'MemberExpression',
    Identifier: 'Identifier',
    Literal: 'Literal'
};

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

    /**
     * @param {Compiler} compiler
     */
    apply(compiler) {

        let self = this;

        Object.assign(compiler.options.resolveLoader.alias, {
            [`${packageName}/dependencies`]: `${packageName}/es5/loaders/dependencies`,
            [`${packageName}/resolvers`]: `${packageName}/es5/loaders/resolvers`,
            [`${packageName}/container`]: `${packageName}/es5/loaders/container`
        });

        compiler.parser.plugin('call Object.defineProperty', ast => {
            let args = ast.arguments, object, property;

            switch (args[0].type) {
                case TYPES.MemberExpression:
                    object = args[0].object.name + "." + args[0].property.name;
                    break;
                case TYPES.Identifier:
                    object = args[0].name;
                    break;
            }

            if (args[1].type === TYPES.Literal) {
                property = args[1].value;
            }

            if (~['module.exports', 'exports'].indexOf(object) && property === self.exportName) {
                Object.assign(self.dependencies, parseObjectAST(args[2]));
            }
        });

        compiler.plugin('compilation', function (compilation, {normalModuleFactory}) {
            compilation.dependencyFactories.set(PrefetchDependency, normalModuleFactory);
        });

        compiler.plugin('make', function (compilation, callback) {

            let resolve, reject;

            compilation.diMetadata = {};
            compilation.diMetadata.promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });

            function prefetch(request, callback) {
                compilation.prefetch(compiler.context, new PrefetchDependency(request), callback);
            }

            let paths = new Scanner({extensions: self.extensions})
                .scanDirectories([].concat(self.src))
                .getPaths()
                .filter(self.filter);

            async.map(paths, prefetch, function(err, modules) {

                if (err) {
                    reject(err);
                    callback(err);
                    return;
                }

                let definitions = normalizeDefinitions(self.dependencies);

                // let requiredModulesNames = uniq(Object.keys(definitions).map(key => definitions[key].bundleName));

                // let requiredModules = modules.filter(module => {
                //     return ~requiredModulesNames.indexOf(extractClassNameFromModule(module));
                // });

                let requiredModules = modules;

                let modulesSet = new WeakSet();

                let test = module => {
                    return module
                        && self.filter(module.resource)
                        && ~self.extensions.indexOf(path.extname(module.resource));
                };

                let filter = module => module && !modulesSet.has(module);

                let extractResolvers = (module) => {
                    modulesSet.add(module);
                    if (test(module)) {
                        self.resolvers[extractClassNameFromModule(module)] = module.userRequest;
                    }
                    module.dependencies.map(d => d.module).filter(filter).forEach(extractResolvers);
                };

                requiredModules.forEach(extractResolvers);

                callback();

                resolve({
                    dependencies: self.dependencies,
                    resolvers: self.resolvers
                });

            });

        });

    }

}
