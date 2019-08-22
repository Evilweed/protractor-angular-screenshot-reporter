var HtmlReporter = require('protractor-beautiful-reporter');
var path = require('path');

// ----- Config example for Jasmine 2 -----

exports.config = {
    // ----- How to setup Selenium -----
    //
    // There are three ways to specify how to use Selenium. Specify one of the
    // following:
    //
    // 1. seleniumServerJar - to start Selenium Standalone locally.
    // 2. seleniumAddress - to connect to a Selenium server which is already
    //    running.
    // 3. sauceUser/sauceKey - to use remote Selenium servers via SauceLabs.

    // The location of the selenium standalone server .jar file.
    //seleniumServerJar: 'node_modules/protractor/selenium/selenium-server-standalone-2.37.0.jar',

    // Address of selenium server (before running protractor, run "webdriver-manager start" to start the Selenium server)
    seleniumAddress: process.env.SELENIUMSERVER ? process.env.SELENIUMSERVER : 'http://localhost:4444/wd/hub',

    // The port to start the selenium server on, or null if the server should
    // find its own unused port.
    seleniumPort: null,

    /* direct connect on my local system*/
    directConnect:!!process.env.CHROMIUM_BIN,

    // Chromedriver location is used to help the selenium standalone server
    // find chromedriver. This will be passed to the selenium jar as
    // the system property webdriver.chrome.driver. If null, selenium will
    // attempt to find chromedriver using PATH.
    //chromeDriver: 'node_modules/protractor/selenium/chromedriver',

    // Additional command line options to pass to selenium. For example,
    // if you need to change the browser timeout, use
    // seleniumArgs: ['-browserTimeout=60'],
    seleniumArgs: [],

    // If sauceUser and sauceKey are specified, seleniumServerJar will be ignored.
    // The tests will be run remotely using SauceLabs.
    sauceUser: null,
    sauceKey: null,

    // ----- What tests to run -----
    //
    // Spec patterns are relative to the location of this config.
    specs: [
        './specs/*.js'
    ],

    // ----- Capabilities to be passed to the webdriver instance ----
    //
    // For a full list of available capabilities, see
    // https://code.google.com/p/selenium/wiki/DesiredCapabilities
    // and
    // https://code.google.com/p/selenium/source/browse/javascript/webdriver/capabilities.js
    capabilities:!!process.env.CHROMIUM_BIN?{
        'browserName': 'chrome',
        'applicationName': 'chromium',
        'chromeOptions': {
            'binary': process.env.CHROMIUM_BIN,
            'args': ['--lang=en',
                '--window-size=1680,1050']
        }
    }:{
        browserName: 'chrome',
        logName: 'Chrome - English',
        version: '',
        platform: 'ANY',
        shardTestFiles: false,
        maxInstances: 2,

        chromeOptions: {
            args: ["--window-size=1680,1000"]
            // commented out but needed to keep it for local testing
            //,  binary: process.env.CHROMIUM_BIN
            //
            //     args:["--headless","--disable-gpu","--window-size=1680,1680"]
            //     args:["--headless","--disable-gpu","--force-device-scale-factor=1.75","--high-dpi-support=1.75","--window-size=1400,1680"]
        }
    },

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: 'http://localhost:9999',

    // Set the framework
    framework: 'jasmine',

    // Selector for the element housing the angular app - this defaults to
    // body, but is necessary if ng-app is on a descendant of <body>
    rootElement: 'body',

    onPrepare: function () {
        // Add a screenshot reporter:
        jasmine.getEnv().addReporter(new HtmlReporter({
            preserveDirectory: false,
            takeScreenShotsOnlyForFailedSpecs: true,
            screenshotsSubfolder: 'images',
            jsonsSubfolder: 'jsons',
            baseDirectory: 'reports-tmp',
            clientDefaults:{
              useAjax:true,
              totalDurationFormat:'hms',
              showTotalDurationIn: 'header'
            }
        }).getJasmine2Reporter());
    },

    jasmineNodeOpts: {
        // If true, print colors to the terminal.
        showColors: true,
        // Default time to wait in ms before a test fails.
        defaultTimeoutInterval: 30000,
    }
};

