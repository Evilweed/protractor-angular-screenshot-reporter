var util = require('./lib/util'),
    mkdirp = require('mkdirp'),
    _ = require('underscore'),
    path = require('path');

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
        pending: results.status === 'pending',
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
    } else if(results.status === 'pending') {
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

/**
 * Returns a reporter that complies with the new Jasmine 2.x custom_reporter.js spec:
 * http://jasmine.github.io/2.1/custom_reporter.html
 */
ScreenshotReporter.prototype.getJasmine2Reporter = function() {
    var self = this;

    return {
        suiteNames: [],
        suiteStarted: function(result){
            this.suiteNames.push(result.description);
        },
        specStarted: function (result) {
            result.started = nowString();

            afterEach(function() {
                browser.getCapabilities().then(function(capabilities) {
                    if (capabilities.browserName === "chrome") {
                        browser.manage().logs().get('browser').then(function (browserLogs) {
                            result.browserLogs = browserLogs;
                            result.browserLogs.concat(browserLogs);
                        })
                    }
                })
            })
        },
        suiteDone: function(result){
            this.suiteNames.pop();
        },
        specDone: function(result) {
            result.stopped = nowString();

            if(!self.takeScreenShotsForSkippedSpecs && result.status == 'disabled') {
                return;
            }

            // Enabling backwards-compat.  Construct Jasmine v1 style spec.suite.
            function buildSuite(suiteNames, i) {
                if(i<0) {return null;}
                return {
                    description: suiteNames[i],
                    parentSuite: buildSuite(suiteNames, i-1)
                };
            }

            var suite = buildSuite(this.suiteNames, this.suiteNames.length-1);

            browser.takeScreenshot().then(function (png) {
                browser.getCapabilities().then(function (capabilities) {
                    var descriptions = util.gatherDescriptions(
                        suite,
                        [result.description]
                        ),

                        baseName = self.pathBuilder(
                            null,
                            descriptions,
                            result,
                            capabilities
                        ),

                        metaData = self.jasmine2MetaDataBuilder(
                            null,
                            descriptions,
                            result,
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

                    if (!(self.takeScreenShotsOnlyForFailedSpecs && result.status === 'passed')) {
                        metaData.screenShotFile = path.join(self.screenshotsSubfolder, screenShotFileName);
                    }

                    metaData.browserLogs = result.browserLogs;
                    metaData.duration = new Date(result.stopped) - new Date(result.started);

                    mkdirp(directory, function (err) {
                        if (err) {
                            throw new Error('Could not create directory ' + directory);
                        } else {
                            util.addMetaData(metaData, metaDataPath, descriptions, self.finalOptions);
                            if (!(self.takeScreenShotsOnlyForFailedSpecs && result.status === 'passed')) {
                                util.storeScreenShot(png, screenShotPath);
                            }
                        }
                    });

                    mkdirp(jsonsDirectory, function (err) {
                        if (err) {
                            throw new Error('Could not create directory ' + jsonsDirectory);
                        } else {
                            util.storeMetaData(metaData, jsonPartsPath);
                        }
                    });
                    // require('fs-symlink')(directory, path.resolve(directory, '..', '_latest'));
                });
            });
        }
    };
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

        if(!self.takeScreenShotsForSkippedSpecs && results.skipped) {
            return;
        }

        browser.takeScreenshot().then(function (png) {
            browser.manage().logs().get('browser').then(function (browserLogs) {
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

                    metaData.browserLogs = browserLogs;

                    mkdirp(directory, function (err) {
                        if (err) {
                            throw new Error('Could not create directory ' + directory);
                        } else {
                            util.addMetaData(metaData, metaDataPath, descriptions, self.finalOptions);
                            if (!(self.takeScreenShotsOnlyForFailedSpecs && results.passed())) {
                                util.storeScreenShot(png, screenShotPath);
                            }
                        }
                    });

                    mkdirp(jsonsDirectory, function (err) {
                        if (err) {
                            throw new Error('Could not create directory ' + jsonsDirectory);
                        } else {
                            util.storeMetaData(metaData, jsonPartsPath);
                        }
                    });
                    // require('fs-symlink')(directory, path.resolve(directory, '..', '_latest'));
                });
            });
        });

    };

function nowString() {
    return (new Date()).toISOString();
}

module.exports = ScreenshotReporter;
