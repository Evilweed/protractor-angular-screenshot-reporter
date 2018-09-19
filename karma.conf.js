
const appPatcher= require('./tests/app-patcher');
appPatcher(__dirname,'./lib/app.js', './tests/app/test_data.js', './tmp/tests/lib/app.js');

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'lib/assets/angular.min.js',
            'tests/app/lib/angular-mocks/angular-mocks.js',
            'node_modules/babel-polyfill/dist/polyfill.js',
            'lib/assets/jquery.min.js',
            'lib/assets/bootstrap.min.js',
            'lib/assets/buttons.js',
            'tmp/tests/lib/app.js',
            'tests/app/test_data.js',
            'tests/app/time_data.js',
            'tests/app/app_test.js'
        ],


        // list of files / patterns to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors:config.cc?{
            'tmp/tests/lib/app.js': ['coverage']
        }:{},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: config.cc ? ['coverage'] : ['spec'],

        coverageReporter: {
            dir: 'tmp/coverage',
            subdir: 'app',
            reporters: [
                {type: 'text-summary'},
                {type: 'html'}
            ]
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 2,
        // plugins: [
        //     'karma-phantomjs-launcher',
        //     'karma-chrome-launcher',
        //     'karma-jasmine'
        // ]
    });
};

