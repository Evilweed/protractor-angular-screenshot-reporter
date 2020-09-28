const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fse = require('fs-extra');

function getTag(value) {
    if (value == null) {
        return value === undefined ? '[object Undefined]' : '[object Null]';
    }
    return toString.call(value);
}

/**
 * checks if the given argument is a real string
 * @param value the value to check
 * @returns {boolean} true if its a string
 * @private
 */
function _isString(value) {
    const type = typeof value;
    return type === 'string' || (type === 'object' && value != null && !Array.isArray(value) && getTag(value) === '[object String]');
}

/** Function: storeScreenShot
 * Stores base64 encoded PNG data to the file at the given path.
 *
 * Parameters:
 *     (String) data - PNG data, encoded in base64
 *     (String) file - Target file path
 */
function storeScreenShot(data, file) {
    try {
        fse.outputFileSync(file, data, {encoding: 'base64'});
    } catch(e) {
        console.error(e);
        console.error('Could not save image: ', file);
    }
}

function cleanArray(actual) {
    const newArray = [];
    for (let i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i]);
        }
    }
    return newArray;
}

function stringifyHtml(source) {
    var quote = '\'';
    var res = source.split(/^/gm).map(function (line) {
        //var quote = '"';
        line = line.replace(/\\/g, '\\\\');
        line = line.replace(/\r/g, '');
        line = line.replace(/\n/g, '');
        // line = line.replace(/\n/g, '\\n');
        // line = line.replace(/\r/g, '\\r');
        var quoteRegExp = new RegExp(quote, 'g');
        line = line.replace(quoteRegExp, '\\' + quote);
        if (line.length > 0) {
            return quote + line + "\\n" + quote + " +\n    ";
        }
        return "";
    }).join('') || '""';

    return res + " " + quote + quote;
}

function buildTemplateJs(file) {
    var templateName = path.basename(file);
    var template = fs.readFileSync(file)
        .toString();
    var stemplate = stringifyHtml(template);
    return "\n  $templateCache.put('" + templateName + "',\n    " + stemplate + "\n  );\n";
}

/**
 * Writes a new _report.html file from the jsonData.
 * @param jsonData combined.json
 * @param baseName
 * @param options
 */
function addHTMLReport(jsonData, baseName, options) {
    const basePath = path.dirname(baseName);
    // Output files
    const htmlFile = path.join(basePath, options.docName);
    const jsFile = path.join(basePath, 'app.js');
    // Input files
    const htmlInFile = path.join(__dirname, 'lib', 'index.html');
    const jsTemplate = path.join(__dirname, 'lib', 'app.js');
    let streamJs;
    let streamHtml;
    let cssLink = path.join('assets', 'bootstrap.css').replace(/\\/g, '/');

    try {

        if (options.cssOverrideFile) {
            cssLink = options.cssOverrideFile;
        }

        if (options.prepareAssets) {
            var cssInsert = `<link rel="stylesheet" href="${cssLink}">`;
            if (options.customCssInline) {
                cssInsert += ` <style type="text/css">${options.customCssInline}</style>`;
            }

            //copy assets
            fse.copySync(path.join(__dirname, 'lib', 'assets'), path.join(basePath, 'assets'));

            //copy bootstrap fonts
            fse.copySync(path.join(__dirname, 'lib', 'fonts'), path.join(basePath, 'fonts'));

            if (options.clientDefaults && options.clientDefaults.useAjax) {
                //copy templates
                fs.copyFileSync(path.join(__dirname, 'lib', 'pbr-screenshot-modal.html'), path.join(basePath, 'pbr-screenshot-modal.html'));
                fs.copyFileSync(path.join(__dirname, 'lib', 'pbr-stack-modal.html'), path.join(basePath, 'pbr-stack-modal.html'));
            }

            // Construct index.html
            streamHtml = fs.createWriteStream(htmlFile);

            streamHtml.write(
                fs.readFileSync(htmlInFile)
                    .toString()
                    .replace('<!-- Here will be CSS placed -->', cssInsert)
                    .replace('<!-- Here goes title -->', options.docTitle)
            );

            streamHtml.end();

        }
        // Construct app.js
        streamJs = fs.createWriteStream(jsFile);

        //prepare clientDefaults for serializations
        var jsonDataString;
        //templates replacement
        var templater;
        if (options.clientDefaults && options.clientDefaults.useAjax) {
            jsonDataString = "[]";
            templater = "";
        } else {
            jsonDataString = JSON.stringify(jsonData, null, 4);
            templater = "";
            templater += buildTemplateJs(path.join(__dirname, 'lib', 'pbr-screenshot-modal.html'));
            templater += buildTemplateJs(path.join(__dirname, 'lib', 'pbr-stack-modal.html'));
        }


        streamJs.write(
            fs.readFileSync(jsTemplate)
                .toString()
                .replace('\[\];//\'<Results Replacement>\'', jsonDataString)
                .replace('defaultSortFunction/*<Sort Function Replacement>*/', options.sortFunction.toString())
                .replace('{};//\'<Client Defaults Replacement>\'', JSON.stringify(options.clientDefaults, null, 4))
                .replace("//'<templates replacement>';", templater)
        );

        streamJs.end();
    } catch(e) {
        console.error(e);
        console.error('Could not save combined.js for data: ' + jsonData);
    }
}

/**
 * Adds the metaData JSON to combined.json
 * combined.json is a JSON list, containing all metaData.
 * @param test the metaData to add to the combined JSON list
 * @param baseName base directory name
 * @param options reporter options passed through
 */
function addMetaData(test, baseName, options) {
    const basePath = path.dirname(baseName);
    const file = path.join(basePath, 'combined.json');
    const lock = path.join(basePath, '.lock');
    let data = [];
    try {
        try {
            fs.mkdirSync(lock);
        } catch(e) {
            // delay if one write operation is pending
            if (e.code === 'EEXIST') {
                setTimeout(function () {
                    addMetaData(test, baseName, options);
                }, 200);
                return;
            }
            // something else happened (e.g. file access permissions)
            throw e;
        }

        //concat all tests
        if (fse.pathExistsSync(file)) {
            data = JSON.parse(fse.readJsonSync(file), {encoding: 'utf8'});
        } else {
            fse.ensureFileSync(file);
            fse.outputJsonSync(file, JSON.stringify([]));
            data = JSON.parse(fse.readJsonSync(file), {encoding: 'utf8'});
        }

        data.push(test);

        fse.outputJsonSync(file, JSON.stringify(data));

        addHTMLReport(data, baseName, options);

        fs.rmdirSync(lock);

    } catch(e) {
        console.error(e);
        console.error('Could not save JSON for data: ' + test);
    }
}

/** Function: storeMetaData
 * Converts the metaData object to a JSON string and stores it to the file at
 * the given path.
 *
 * Parameters:
 *     (Object) metaData - Object to save as JSON
 *     (String) file - Target file path
 */
function storeMetaData(metaData, file, descriptions) {
    try {
        metaData.description = cleanArray(descriptions).join('|');
        fse.outputJsonSync(file, metaData);
    } catch(e) {
        console.error(e);
        console.error('Could not save meta data for ' + file);
    }
}


/** Function: gatherDescriptions
 * Traverses the parent suites of a test spec recursivly and gathers all
 * descriptions. Finally returns them as an array.
 *
 * Example:
 * If your test file has the following structure, this function returns an
 * array like ['My Tests', 'Module 1', 'Case A'] when executed for `Case A`:
 *
 *     describe('My Tests', function() {
 *         describe('Module 1', function() {
 *             it('Case A', function() { /* ... * / });
 *         });
 *     });
 *
 * Parameters:
 *     (Object) suite - Test suite
 *     (Array) soFar - Already gathered descriptions. On first call, pass an
 *                     array containing the specs description itself.
 *
 * Returns:
 *     (Array) containing the descriptions of all parental suites and the suite
 *             itself.
 */
function gatherDescriptions(suite, soFar) {
    if (suite.description != null) { // jshint ignore:line
        //the != above is intentional: !== would distinguish between null and undefined (and we do not want this)
        soFar.push(suite.description);
    }

    if (suite.parentSuite) {
        return gatherDescriptions(suite.parentSuite, soFar);
    } else {
        return soFar;
    }
}

/** Function: generateGuid
 * Generates a GUID using node.js' crypto module.
 *
 * Returns:
 *     (String) containing a guid
 */
function generateGuid() {
    let buf = new Uint16Array(8);
    buf = crypto.randomBytes(8);
    const S4 = function (num) {
        let ret = num.toString(16);
        while (ret.length < 4) {
            ret = "0" + ret;
        }
        return ret;
    };

    return (
        S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" +
        S4(buf[4]) + "-" + S4(buf[5]) + S4(buf[6]) + S4(buf[7])
    );
}

function removeDirectory(dirPath) {
    let files;
    try {
        files = fs.readdirSync(dirPath);
    } catch(e) {
        return;
    }
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            } else {
                removeDirectory(filePath);
            }
        }
    }
    fs.rmdirSync(dirPath);
}

module.exports = {
    storeScreenShot: storeScreenShot
    , storeMetaData: storeMetaData
    , gatherDescriptions: gatherDescriptions
    , generateGuid: generateGuid
    , addMetaData: addMetaData
    , removeDirectory: removeDirectory
    , _isString: _isString
};
