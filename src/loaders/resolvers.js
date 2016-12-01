import {normalizeDefinitions} from 'di.js';
import {uniq} from '../utils';

export default function () {

    let cb = this.async();

    this._compilation.diMetadata.promise.then(({dependencies, resolvers}) => {
        let definitions = normalizeDefinitions(dependencies);

        let requiredModules = uniq(Object.keys(definitions).map(key => definitions[key].bundleName));

        let resolverBody = Object.keys(resolvers).filter(name => {
            return true;
            return resolvers.hasOwnProperty(name) && ~requiredModules.indexOf(name);
        }).map(name => {
            return `${name}: function(){ return require(${JSON.stringify(resolvers[name])});}`;
        }).join(',\n');

        let staticResolverModule = [
            'var staticResolver = function(config) {' +
            '   return function(moduleName) {' +
            '       if (config[moduleName]) {' +
            '           return config[moduleName]();' +
            '       }' +
            '   }' +
            '};'
        ].join('\n');

        let resolver = `staticResolver({\n${resolverBody}\n})`;

        let code = [
            `${staticResolverModule}\n`,
            `module.exports = [${resolver}];`
        ].join('\n');

        cb(null, code);
    }, cb);


};
