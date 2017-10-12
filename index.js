var util = require('./lib/util'),
    mkdirp = require('mkdirp'),
    _ = require('underscore'),
    path = require('path'),
    CircularJSON = require('circular-json'),
    fse = require('fs-extra');

/** Function: defaultPathBuilder
 * This function builds paths for a screenshot file. It is appended to the
 * constructors base directory and gets prependend with `.png` or `.json` when
 * storing a screenshot or JSON meta data file.
 *
 * Parameters:
 *     (Object) spec - The spec currently reported
 *     (Array) descriptions - The specs and their parent suites descriptions
 *     (Object) result - The result object of the current test spec.
 *     (Object) capabilities - WebDrivers capabilities object containing
 *                             in-depth information about the Selenium node
 *                             which executed the test case.
 *
 * Returns:
 *     (String) containing the built path
 */
function defaultPathBuilder(spec, descriptions, results, capabilities) {
    return util.generateGuid();
}

/** Function: defaultMetaDataBuilder
 * Uses passed information to generate a meta data object which can be saved
 * along with a screenshot.
 * You do not have to add the screenshots file path since this will be appended
 * automatically.
 *
 * Parameters:
 *     (Object) spec - The spec currently reported
 *     (Array) descriptions - The specs and their parent suites descriptions
 *     (Object) result - The result object of the current test spec.
 *     (Object) capabilities - WebDrivers capabilities object containing
 *                             in-depth information about the Selenium node
 *                             which executed the test case.
 *
 * Returns:
 *     (Object) containing meta data to store along with a screenshot
 */
function defaultMetaDataBuilder(spec, descriptions, results, capabilities) {
    var metaData = {
        description: descriptions.join(' '),
        passed: results.passed(),
        os: capabilities.caps_.platform,
        sessionId: capabilities.caps_['webdriver.remote.sessionid'],
        browser: {
            name: capabilities.caps_.browserName,
            version: capabilities.caps_.version
        }
    };

    if(results.items_.length > 0) {
        var result = results.items_[0];
        if(!results.passed()){
            var failedItem = _.where(results.items_,{passed_: false})[0];
            if(failedItem){
                metaData.message = failedItem.message || 'Failed';
                metaData.trace = failedItem.trace? (failedItem.trace.stack || 'No Stack trace information') : 'No Stack trace information';
            }

        }else{
            metaData.message = result.message || 'Passed';
            metaData.trace = result.trace.stack;
        }

    }

    return metaData;
}


function jasmine2MetaDataBuilder(spec, descriptions, results, capabilities) {
    var metaData = {
        description: descriptions.join(' '),
        passed: results.status === 'passed',
        pending: results.status === 'pending' || results.status === 'disabled',
        os: capabilities.get('platform'),
        sessionId: capabilities.get('webdriver.remote.sessionid'),
        browser: {
            name: capabilities.get('browserName'),
            version: capabilities.get('version')
        }
    };

    if(results.status === 'passed') {
        metaData.message = (results.passedExpectations[0] || {}).message || 'Passed';
        metaData.trace = (results.passedExpectations[0] || {}).stack;
    } else if(results.status === 'pending' || results.status === 'disabled') {
        metaData.message = results.pendingReason || 'Pending';
    } else {
        metaData.message = (results.failedExpectations[0] || {}).message || 'Failed';
        metaData.trace = (results.failedExpectations[0] || {}).stack || 'No Stack trace information';
    }

    return metaData;
}



/** Class: ScreenshotReporter
 * Creates a new screenshot reporter using the given `options` object.
 *
 * For more information, please look at the README.md file.
 *
 * Parameters:
 *     (Object) options - Object with options as described below.
 *
 * Possible options:
 *     (String) baseDirectory - The path to the directory where screenshots are
 *                              stored. If not existing, it gets created.
 *                              Mandatory.
 *     (Function) pathBuilder - A function which returns a path for a screenshot
 *                              to be stored. Optional.
 *     (Function) metaDataBuilder - Function which returns an object literal
 *                                  containing meta data to store along with
 *                                  the screenshot. Optional.
 *     (Boolean) takeScreenShotsForSkippedSpecs - Do you want to capture a
 *                                                screenshot for a skipped spec?
 *                                                Optional (default: false).
 */
function ScreenshotReporter(options) {
    options = options || {};
    if(!options.baseDirectory || options.baseDirectory.length === 0) {
        throw new Error('Please pass a valid base directory to store the ' +
            'screenshots into.');
    } else {
        this.baseDirectory = options.baseDirectory;
    }

    if(typeof (options.cssOverrideFile) !== 'undefined' && _.isString(options.cssOverrideFile) ){
        this.cssOverrideFile = options.cssOverrideFile;
    } else {
        this.cssOverrideFile = null;
    }

    if(typeof (options.screenshotsSubfolder) !== 'undefined' &&  _.isString(options.screenshotsSubfolder) ){
        this.screenshotsSubfolder = options.screenshotsSubfolder;
    } else {
        this.screenshotsSubfolder = '';
    }

    if(typeof (options.jsonsSubfolder) !== 'undefined' &&  _.isString(options.jsonsSubfolder) ){
        this.jsonsSubfolder = options.jsonsSubfolder;
    } else {
        this.jsonsSubfolder = '';
    }

    this.pathBuilder = options.pathBuilder || defaultPathBuilder;
    this.docTitle = options.docTitle || 'Generated test report';
    this.docName = options.docName || 'report.html';
    this.metaDataBuilder = options.metaDataBuilder || defaultMetaDataBuilder;
    this.jasmine2MetaDataBuilder = options.jasmine2MetaDataBuilder || jasmine2MetaDataBuilder;
    this.preserveDirectory = typeof options.preserveDirectory !== 'undefined' ? options.preserveDirectory : true;
    this.takeScreenShotsForSkippedSpecs =
        options.takeScreenShotsForSkippedSpecs || false;
    this.gatherBrowserLogs =
        options.gatherBrowserLogs || true;
    this.takeScreenShotsOnlyForFailedSpecs =
        options.takeScreenShotsOnlyForFailedSpecs || false;
    this.finalOptions = {
        takeScreenShotsOnlyForFailedSpecs: this.takeScreenShotsOnlyForFailedSpecs,
        takeScreenShotsForSkippedSpecs: this.takeScreenShotsForSkippedSpecs,
        metaDataBuilder: this.metaDataBuilder,
        pathBuilder: this.pathBuilder,
        baseDirectory: this.baseDirectory,
        screenshotsSubfolder: this.screenshotsSubfolder,
        docTitle: this.docTitle,
        docName: this.docName,
        cssOverrideFile: this.cssOverrideFile
    };

    if(!this.preserveDirectory){
        util.removeDirectory(this.finalOptions.baseDirectory);
    }
}

class Jasmine2Reporter {

    constructor({screenshotReporter}) {

        /* `_asyncFlow` is a promise.
         * It is a "flow" that we create in `specDone`.
         * `suiteDone`, `suiteStarted` and `specStarted` will then add their steps to the flow and the `beforeEach`
         * function will wait for the flow to finish before running the next spec. */
        this._asyncFlow = null;

        this._screenshotReporter = screenshotReporter;
        this._suiteNames = [];

    }

    jasmineStarted() {

        /* Register `beforeEach` that will wait for all tasks in flow to be finished. */
        beforeEach(() => this._beforeEach());

    }

    suiteStarted(result) {
        this._addTaskToFlow(async () => this._suiteNames.push(result.description));
    }

    suiteDone(result) {
        this._addTaskToFlow(async () => this._suiteNames.pop());
    }

    specStarted(result) {
        this._addTaskToFlow(async () => result.started = nowString());
    }

    specDone(result) {
        this._addTaskToFlow(async () => this._asyncSpecDone(result));
    }

    _addTaskToFlow(callback) {

        /* Create. */
        if (this._asyncFlow == null) {
            this._asyncFlow = callback();
        }
        /* Chain. */
        else {
            this._asyncFlow = this._asyncFlow.then(callback);
        }

    }

    /* @hack: `beforeEach` waits for `specDone` task to finish before running the next spec.*/
    async _beforeEach() {
        await this._asyncFlow;
        this._asyncFlow = null;
    }

    async _asyncSpecDone(result) {

        result.stopped = nowString();

        await this._gatherBrowserLogs(result);
        await this._takeScreenShotAndAddMetaData(result);

    }

    async _gatherBrowserLogs(result) {

        if (!this._screenshotReporter.gatherBrowserLogs) {
            return;
        }

        const capabilities = await browser.getCapabilities();
        const browserName = capabilities.get('browserName');

        /* Skip incompatible browsers. */
        if (browserName == null || !browserName.toLowerCase().match(/chrome/)) {
            return;
        }

        result.browserLogs = await browser.manage().logs().get('browser');

    }

    async _takeScreenShotAndAddMetaData(result) {

        const capabilities = await browser.getCapabilities();
        const suite = this._buildSuite();

        var descriptions = util.gatherDescriptions(
            suite,
            [result.description]
            ),

            baseName = this._screenshotReporter.pathBuilder(
                null,
                descriptions,
                result,
                capabilities
            ),

            metaData = this._screenshotReporter.jasmine2MetaDataBuilder(
                null,
                descriptions,
                result,
                capabilities
            ),

            screenShotFileName = path.basename(baseName + '.png'),
            screenShotFilePath = path.join(path.dirname(baseName + '.png'), this._screenshotReporter.screenshotsSubfolder),

            metaFile = baseName + '.json',
            screenShotPath = path.join(this._screenshotReporter.baseDirectory, screenShotFilePath, screenShotFileName),
            metaDataPath = path.join(this._screenshotReporter.baseDirectory, metaFile),
            jsonPartsPath = path.join(this._screenshotReporter.baseDirectory, path.dirname(metaFile), this._screenshotReporter.jsonsSubfolder, path.basename(metaFile)),

            // pathBuilder can return a subfoldered path too. So extract the
            // directory path without the baseName
            directory = path.dirname(screenShotPath),
            jsonsDirectory = path.dirname(jsonPartsPath);

        metaData.browserLogs = [];

        if (!(this._screenshotReporter.takeScreenShotsOnlyForFailedSpecs && result.status === 'passed')) {
            metaData.screenShotFile = path.join(this._screenshotReporter.screenshotsSubfolder, screenShotFileName);
        }

        if (result.browserLogs) { metaData.browserLogs = result.browserLogs };
        metaData.duration = new Date(result.stopped) - new Date(result.started);

        if ((result.status != 'pending' && result.status != 'disabled') && !(this._screenshotReporter.takeScreenShotsOnlyForFailedSpecs && result.status === 'passed')) {
            const png = await browser.takeScreenshot();
            util.storeScreenShot(png, screenShotPath);
        }

        util.storeMetaData(metaData, jsonPartsPath, descriptions);
        util.addMetaData(metaData, metaDataPath, this._screenshotReporter.finalOptions);

    }

    // Enabling backwards-compat.  Construct Jasmine v1 style spec.suite.
    _buildSuite() {

        const buildSuite = (suiteNames, i) => {
            if(i<0) {return null;}
            return {
                description: suiteNames[i],
                parentSuite: buildSuite(suiteNames, i-1)
            };
        };

        return buildSuite(this._suiteNames, this._suiteNames.length);

    }

}

/**
 * Returns a reporter that complies with the new Jasmine 2.x custom_reporter.js spec:
 * http://jasmine.github.io/2.1/custom_reporter.html
 */
ScreenshotReporter.prototype.getJasmine2Reporter = function() {

    return new Jasmine2Reporter({screenshotReporter: this});

};



/** Function: reportSpecResults
 * Called by Jasmine when reporting results for a test spec. It triggers the
 * whole screenshot capture process and stores any relevant information.
 *
 * Parameters:
 *     (Object) spec - The test spec to report.
 */
ScreenshotReporter.prototype.reportSpecResults =
    function reportSpecResults(spec) {
        /* global browser */
        var self = this,
            results = spec.results();

        browser.getCapabilities().then(function (capabilities) {
            var descriptions = util.gatherDescriptions(
                spec.suite,
                [spec.description]
                ),
                baseName = self.pathBuilder(
                    spec,
                    descriptions,
                    results,
                    capabilities
                ),

                metaData = self.metaDataBuilder(
                    spec,
                    descriptions,
                    results,
                    capabilities
                ),
                screenShotFileName = path.basename(baseName + '.png'),
                screenShotFilePath = path.join(path.dirname(baseName + '.png'), self.screenshotsSubfolder),

                metaFile = baseName + '.json',
                screenShotPath = path.join(self.baseDirectory, screenShotFilePath, screenShotFileName),
                metaDataPath = path.join(self.baseDirectory, metaFile),
                jsonPartsPath = path.join(self.baseDirectory, path.dirname(metaFile), self.jsonsSubfolder, path.basename(metaFile)),

                // pathBuilder can return a subfoldered path too. So extract the
                // directory path without the baseName
                directory = path.dirname(screenShotPath),
                jsonsDirectory = path.dirname(jsonPartsPath);

            metaData.browserLogs = [];

            if (!(self.takeScreenShotsOnlyForFailedSpecs && results.passed())) {
                metaData.screenShotFile = path.join(self.screenshotsSubfolder, screenShotFileName);
            }

            if (results.browserLogs) { metaData.browserLogs = results.browserLogs };

            if ((!results.skipped) && !(self.takeScreenShotsOnlyForFailedSpecs && results.passed())) {
                browser.takeScreenshot().then(function (png) {
                    util.storeMetaData(metaData, jsonPartsPath, descriptions);
                    util.addMetaData(metaData, metaDataPath, self.finalOptions);
                }).catch(function(e) {
                    console.warn('Could not store Meta Data or add Meta Data to combined.js and generate report');
                    console.warn(e);
                });
            } else {
                util.storeMetaData(metaData, jsonPartsPath, descriptions);
                util.addMetaData(metaData, metaDataPath, self.finalOptions);
            }
        });
    };

function nowString() {
    return (new Date()).toISOString();
}

module.exports = ScreenshotReporter;
