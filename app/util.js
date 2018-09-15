var fs = require('fs')
    , path = require('path')
    , crypto = require('crypto')
    , CircularJSON = require('circular-json')
    , fse = require('fs-extra');



/** Function: storeScreenShot
 * Stores base64 encoded PNG data to the file at the given path.
 *
 * Parameters:
 *     (String) data - PNG data, encoded in base64
 *     (String) file - Target file path
 */
function storeScreenShot(data, file) {
    try {
        fse.outputFileSync(file, data, {encoding: 'base64'})
    } catch(e) {
        console.error(e);
        console.error('Could not save image: ', file);
    }
}

/**
 * Writes a new _report.html file from the jsonData.
 * @param jsonData combined.json
 * @param baseName
 * @param options
 */
function addHTMLReport(jsonData, baseName, options){
    var basePath = path.dirname(baseName),
        // Output files
        htmlFile = path.join(basePath, options.docName),
        jsFile = path.join(basePath, 'app.js'),
        // Input files
        htmlInFile = path.join(__dirname, 'lib', 'index.html'),
        jsTemplate = path.join(__dirname, 'lib', 'app.js'),
        streamJs,
        streamHtml,
        cssLink = path.join('assets', 'bootstrap.css');

    try {
        if (options.cssOverrideFile) {
            cssLink = options.cssOverrideFile;
        }

        if (options.prepareAssets) {
            //copy assets
            fse.copySync(path.join(__dirname, 'lib', 'assets'), path.join(basePath, 'assets'));

            //copy bootstrap fonts
            fse.copySync(path.join(__dirname, 'lib', 'fonts'), path.join(basePath, 'fonts'));


            // Construct index.html
            streamHtml = fs.createWriteStream(htmlFile);

            streamHtml.write(
                fs.readFileSync(htmlInFile)
                    .toString()
                    .replace('<!-- Here will be CSS placed -->', '<link rel="stylesheet" href="'+cssLink.replace(/\\/, '/')+'">')
                    .replace('<!-- Here goes title -->', options.docTitle)
            );

            streamHtml.end();

        }
        // Construct app.js
        streamJs = fs.createWriteStream(jsFile);

        streamJs.write(
            fs.readFileSync(jsTemplate)
                .toString()
                .replace('\'<Results Replacement>\'', JSON.stringify(jsonData, null, 4))
                .replace('\'<Sort Function Replacement>\'', options.sortFunction.toString())
                .replace('\'<Search Settings Replacement>\'',options.searchSettings?JSON.stringify(options.searchSettings):'{}')
                .replace('\'<Column Settings Replacement>\'',options.columnSettings?JSON.stringify(options.columnSettings):'undefined')
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
 * @param metaData the metaData to add to the combined JSON list
 * @param baseName
 * @param descriptions
 * @param options
 */
function addMetaData(test, baseName, options){
    var json,
        basePath = path.dirname(baseName),
        jsonsDirectory = path.join(basePath,'jsons'),
        file = path.join(basePath,'combined.json'),
        lock = path.join(basePath,'.lock'),
        data = [];

    try {
        // delay if one write operation is pending
        if (fse.pathExistsSync(lock)) {
            setTimeout(function () {
                addMetaData(test, baseName, options);
            }, 200);
            return;
        }
        fs.mkdirSync(lock);
        //concat all tests
        if (fse.pathExistsSync(file)) {
            data = JSON.parse(fse.readJsonSync(file), {encoding: 'utf8'});
        } else {
            fse.ensureFileSync(file);
            fse.outputJsonSync(file, CircularJSON.stringify([]));
            data = JSON.parse(fse.readJsonSync(file), {encoding: 'utf8'});
        }

        data.push(test);

        fse.outputJsonSync(file, CircularJSON.stringify(data));
        
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

function cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i]);
        }
    }
    return newArray;
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
    if (suite.description != null) { soFar.push(suite.description) };

    if(suite.parentSuite) {
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
    var buf = new Uint16Array(8);
    buf = crypto.randomBytes(8);
    var S4 = function(num) {
        var ret = num.toString(16);
        while(ret.length < 4){
            ret = "0"+ret;
        }
        return ret;
    };

    return (
        S4(buf[0])+S4(buf[1])+"-"+S4(buf[2])+"-"+S4(buf[3])+"-"+
        S4(buf[4])+"-"+S4(buf[5])+S4(buf[6])+S4(buf[7])
    );
}

function removeDirectory(dirPath){
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                removeDirectory(filePath);
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
};
