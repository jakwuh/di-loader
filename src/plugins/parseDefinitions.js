import {parseDescriptorAST} from '../utils';

const TYPES = {
    MemberExpression: 'MemberExpression',
    Identifier: 'Identifier',
    Literal: 'Literal'
};

function extractObjectName(ast) {
    switch (ast.type) {
        case TYPES.MemberExpression:
            return ast.object.name + "." + ast.property.name;
        case TYPES.Identifier:
            return ast.name;
    }
}

function extractString(ast) {
    if (ast.type === TYPES.Literal) {
        return ast.value;
    }
}

export default function(ast) {
    let descriptorAST = ast.arguments[2];
    let property = extractString(ast.arguments[1]);
    let object = extractObjectName(ast.arguments[0]);

    if (~['module.exports', 'exports'].indexOf(object) && property === this.exportName) {
        Object.assign(this.dependencies, parseDescriptorAST(descriptorAST));
    }
}
