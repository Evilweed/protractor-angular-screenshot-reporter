const fs = require('fs');
const path = require('path');
const reportsTmpPath = ('./reports-tmp');
module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        shell: {
            "options": {
                stdout: true
            },
            "selenium": {
                command: './selenium/start',
                options: {
                    stdout: false,
                    async: true
                }
            },
            "protractor_install": {
                command: 'node ./node_modules/protractor/bin/webdriver-manager update'
            },
            "webdriver_start": {
                command: 'node ./node_modules/protractor/bin/webdriver-manager start'
            },
            "npm_install": {
                command: 'npm install'
            }
        },

        protractor: {
            options: {
                keepAlive: true,
                configFile: "protractor.jasmine2-useajax.conf.js"
            },
            singlerun: {},
            auto: {
                keepAlive: true,
                options: {
                    args: {
                        seleniumPort: 4444
                    }
                }
            }
        }

    });


    grunt.registerTask('test:e2e', ['protractor:singlerun']);
    grunt.registerTask('install', ['update', 'shell:protractor_install']);
    grunt.registerTask('update', ['shell:npm_install']);
    grunt.registerTask('unescape-combined-json', () => {
        const CircularJSON = require('circular-json');
        function doUnEscape(jsonFile,entry){
            const text = fs.readFileSync(jsonFile).toString();
            if (text && text[0] === `"`) {
                console.log(`unescaped combined.json in '${entry}'`);
                const cs = CircularJSON.parse(text);
                const obj = JSON.parse(cs);
                const str = JSON.stringify(obj, null, 4);
                fs.writeFileSync(jsonFile, str);
            } else { //else do nothing as the file is already unescaped
                console.log(`doing nothing combined json in '${entry}' is already unescaped`);
            }
        }
        const dirContents = fs.readdirSync(reportsTmpPath);
        for (let entry of dirContents) {
            let fpath = path.resolve(reportsTmpPath, entry);
            if (fs.statSync(fpath).isDirectory()) {
                const jsonFile = path.join(fpath, 'combined.json');
                if (fs.existsSync(jsonFile)) {
                    doUnEscape(jsonFile,entry);
                }

            } else if (path.basename(fpath) === 'combined.json') {
                doUnEscape(fpath,entry);
            }
        }

    });

};