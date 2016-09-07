
function loader(){}

loader.pitch = function(remainingRequest) {
    this.cacheable && this.cacheable();

    let code = [
        `var createContainer = require('di.js').createContainer;\n`,
        `module.exports = createContainer({`,
        `   resolvers: require(${JSON.stringify('!!di-loader/resolvers!' + remainingRequest)}),`,
        `   dependencies: require(${JSON.stringify('!!di-loader/dependencies!' + remainingRequest)}),`,
        `});`
    ].join('\n');

    return code;

};

export default loader;
