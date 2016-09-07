export default function() {

    let cb = this.async();

    this._compilation.diMetadata.promise.then(({dependencies}) => {
        let code = `module.exports = ${JSON.stringify(dependencies, null, 2)};`;
        cb(null, code);
    }, cb);

}
