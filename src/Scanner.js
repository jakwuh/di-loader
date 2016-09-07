import fs from 'fs';
import path from 'path';

export class Scanner {

    /**
     * @param {string[]} extensions
     */
    constructor({extensions}) {
        this.paths = [];
        this.extensions = extensions;
    }

    /**
     * @param {string[]} directories
     * @returns {Scanner}
     */
    scanDirectories(directories) {
        directories.forEach(this.scanDirectory.bind(this));
        return this;
    }

    /**
     * @param {string} directory
     * @returns {Scanner}
     */
    scanDirectory(directory) {
        fs.readdirSync(directory).forEach(filename => {
            let filepath = path.resolve(directory, filename),
                stat = fs.statSync(filepath);

            if (stat.isFile()) {
                if (~this.extensions.indexOf(path.extname(filename))) {
                    this.paths.push(filepath);
                }
            } else {
                this.scanDirectory(filepath);
            }
        });

        return this;
    }

    getPaths() {
        return this.paths;
    }


}
