import PrefetchDependency from 'webpack/lib/dependencies/PrefetchDependency';

export default function (compilation, {normalModuleFactory}) {
    compilation.dependencyFactories.set(PrefetchDependency, normalModuleFactory);
}
