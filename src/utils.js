import {generate} from 'escodegen';
import path from 'path';
import vm from 'vm';

export function uniq(arr) {
    return Array.from(new Set(arr));
}

export function parseDescriptorAST(ast) {
    const descriptor = {};
    const script = new vm.Script("value = " + generate(ast));
    const context = new vm.createContext(descriptor);
    script.runInContext(context);
    return descriptor.value.value;
}

export function extractClassNameFromModule(module) {
    return path.basename(module.userRequest, '.js');
}

export function sortObject(o) {
    let pairs = [];
    for (let [key, value] of Object.entries(o)) {
        pairs.push([key, value]);
    }
    pairs.sort((a, b) => a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0));
    return pairs.reduce((memo, [key, value]) => Object.assign(memo, {[key]: value}), {});
}
