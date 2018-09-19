
const Jasmine = require('jasmine');
const jasmine = new Jasmine();

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;


jasmine.loadConfigFile('jasmine.json');

jasmine.clearReporters();

const specReporter = new SpecReporter({  // add jasmine-spec-reporter
    spec: {
        displayPending: true,
        displayStacktrace:true,
        displayFailed:true
    },
    summary: {
        displayPending: false
    }
});

jasmine.addReporter(specReporter);

jasmine.execute();


