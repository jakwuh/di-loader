import {generate} from 'escodegen';
import path from 'path';
import vm from 'vm';

export function uniq(arr) {
    let out = [];
    arr.forEach(el => {
        if (!~out.indexOf(el)) {
            out.push(el);
        }
    });
    return out;
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

