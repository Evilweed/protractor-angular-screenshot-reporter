(function() {
    const fs = require('fs');
    const path = require('path');
    const mkdirp = require('mkdirp');

// for unit testing the app.js file has to patched (in runtime this is done while executing the e2e reporter)
    const oldVersion = false; //fersing with other replacement strings


//this function is a copy of the sort funcgtion in /app/util.js
    function sortFunction(a, b) {
        if (a.sessionId < b.sessionId) return -1;
        else if (a.sessionId > b.sessionId) return 1;

        if (a.timestamp < b.timestamp) return -1;
        else if (a.timestamp > b.timestamp) return 1;

        return 0;
    }

    function patchAppJs(baseDir, jsFile, dataFile, outFile) {
        const outFilePath = path.resolve(baseDir, outFile);
        const outDir = path.dirname(outFilePath);
        if (!fs.existsSync(outDir)) {
            mkdirp.sync(outDir);
        }
        const jsFilePath = path.resolve(baseDir, jsFile);
        const dataFilePath = path.resolve(baseDir, dataFile);
        const testData = fs.readFileSync(dataFilePath, 'utf-8').toString();
        let content = fs.readFileSync(jsFilePath, 'utf-8').toString();
        if (oldVersion) {
            content = content.replace("var results = '<Results Replacement>';", testData)
                .replace('\'<Sort Function Replacement>\'', sortFunction.toString())
                .replace('\'<Search Settings Replacement>\'', '{}')
                .replace('\'<Column Settings Replacement>\'', 'undefined');

        } else {
            content = content.replace("var results = [];//'<Results Replacement>'", testData)
                .replace('defaultSortFunction/*<Sort Function Replacement>*/', sortFunction.toString())
                .replace('{};//\'<Client Defaults Replacement>\'', "{}");
        }

        fs.writeFileSync(outFilePath, content, 'utf-8');

    }

    module.exports = patchAppJs;

})();

