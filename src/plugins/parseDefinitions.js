import {parseDescriptorAST} from '../utils';

const TYPES = {
    Literal: 'Literal'
};

function extractString(ast) {
    if (ast.type === TYPES.Literal) {
        return ast.value;
    }
}

export default function(ast) {
    let descriptorAST = ast.arguments[2];
    let property = extractString(ast.arguments[1]);

    if (property === this.exportName) {
        Object.assign(this.dependencies, parseDescriptorAST(descriptorAST));
    }
}
