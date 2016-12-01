import PrefetchDependency from 'webpack/lib/dependencies/PrefetchDependency';
import {extractClassNameFromModule, sortObject} from '../utils';
import async from 'async';
import path from 'path';

export default function (compilation, callback) {

    let compiler = compilation.compiler;
    let resolve, reject;

    compilation.diMetadata = {
        promise: new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        })
    };

    function prefetch(request, callback) {
        if (!this.prefetchedPaths.has(request)) {
            compilation.prefetch(compiler.context, new PrefetchDependency(request), (...args) => {
                this.prefetchedPaths.set(request, args);
                callback(...args);
            });
        } else {
            callback(...this.prefetchedPaths.get(request));
        }
    }

    async.map(this.paths, prefetch.bind(this), (err, modules) => {
        if (err) {
            reject(err);
            return callback(err);
        }

        let requiredModules = modules;

        let modulesSet = new WeakSet();

        let test = module => {
            return module
                && this.filter(module.resource)
                && ~this.extensions.indexOf(path.extname(module.resource));
        };

        let filter = module => module && !modulesSet.has(module);

        let extractResolvers = (module) => {
            modulesSet.add(module);
            if (test(module)) {
                this.resolvers[extractClassNameFromModule(module)] = module.userRequest;
            }
            module.dependencies.map(d => d.module).filter(filter).forEach(extractResolvers);
        };

        requiredModules.filter(filter).forEach(extractResolvers);

        callback();

        resolve({
            dependencies: sortObject(this.dependencies),
            resolvers: sortObject(this.resolvers)
        });

    });

}
