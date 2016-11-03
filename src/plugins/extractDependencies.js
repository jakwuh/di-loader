import PrefetchDependency from 'webpack/lib/dependencies/PrefetchDependency';
import {extractClassNameFromModule} from '../utils';
import {Scanner} from '../Scanner';
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
        compilation.prefetch(compiler.context, new PrefetchDependency(request), callback);
    }

    let paths = new Scanner({extensions: this.extensions, filter: this.filter})
        .scanDirectories([].concat(this.src))
        .getPaths()
        .filter(this.filter);

    async.map(paths, prefetch, (err, modules) => {

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
            dependencies: this.dependencies,
            resolvers: this.resolvers
        });

    });

}
