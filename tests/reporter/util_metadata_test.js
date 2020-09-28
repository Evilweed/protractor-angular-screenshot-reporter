const util = require('../../app/util');
const fs = require('fs');
const fse = require('fs-extra');

const testResults = require('./test_data');

const defaultSortFunction = (a, b) => {
    return (a + b) ? 0 : 0; //
};


describe('unit tests', () => {

    describe('reporter utils', () => {

        describe('storeMetaData (also covers cleanArray function)', () => {
            //because cleanArray is not exported, but used by storeMetaData function (which is exported)
            //we test it indirectly via calling storeMetaData function

            describe('crash scenarios', () => {
                it('catches error and logs with undefined params', () => {
                    spyOn(console, 'error').and.stub();
                    spyOn(fse, 'outputJsonSync').and.stub();
                    util.storeMetaData(undefined, undefined, undefined);
                    expect(fse.outputJsonSync).not.toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(new TypeError("Cannot read property 'length' of undefined"));
                });
                it('catches error and logs with null or undefined params 1', () => {
                    spyOn(console, 'error').and.stub();
                    spyOn(fse, 'outputJsonSync').and.stub();
                    util.storeMetaData(null, undefined, undefined);
                    expect(fse.outputJsonSync).not.toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(new TypeError("Cannot read property 'length' of undefined"));
                });
                it('catches error and logs with null or undefined params 2', () => {
                    spyOn(console, 'error').and.stub();
                    spyOn(fse, 'outputJsonSync').and.stub();
                    util.storeMetaData(null, null, undefined);
                    expect(fse.outputJsonSync).not.toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(new TypeError("Cannot read property 'length' of undefined"));
                });
                it('catches error and logs with null params', () => {
                    spyOn(console, 'error').and.stub();
                    spyOn(fse, 'outputJsonSync').and.stub();
                    util.storeMetaData(null, null, null);
                    expect(fse.outputJsonSync).not.toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(new TypeError("Cannot read property 'length' of null"));
                });
                it('catches error and logs with file write fails invalid', () => {
                    spyOn(console, 'error').and.stub();
                    const outputJsonSpy = spyOn(fse, 'outputJsonSync').and.callFake(() => {
                        throw new Error("don't care");
                    });
                    const metaData = {
                        description: ""
                    };
                    const descriptions = [];
                    util.storeMetaData(metaData, null, descriptions);
                    expect(outputJsonSpy).toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(new Error("don't care"));
                });
                it('catches error and logs with file write fails invalid (file is not null)', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/outfile.json";
                    spyOn(console, 'error').and.stub();
                    const outputJsonSpy = spyOn(fse, 'outputJsonSync').and.callFake(() => {
                        throw new Error("don't care");
                    });
                    const metaData = {
                        description: ""
                    };
                    const descriptions = [];
                    util.storeMetaData(metaData, fakePath, descriptions);
                    expect(outputJsonSpy).toHaveBeenCalledWith(fakePath, metaData);
                    expect(console.error).toHaveBeenCalledWith(new Error("don't care"));
                });

                it('catches error and logs with file if descriptions is undefined', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/outfile.json";
                    spyOn(console, 'error').and.stub();
                    const outputJsonSpy = spyOn(fse, 'outputJsonSync').and.stub();
                    const metaData = {
                        description: ""
                    };
                    const descriptions = null;
                    util.storeMetaData(metaData, fakePath, descriptions);
                    expect(outputJsonSpy).not.toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(new TypeError("Cannot read property 'length' of null"));
                });


            }); // crash scenarios

            describe('working scenarios', () => {
                it('does not crash even if descriptions is not an array', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/outfile.json";
                    spyOn(console, 'error').and.stub();
                    const outputJsonSpy = spyOn(fse, 'outputJsonSync').and.stub();
                    const metaData = {
                        description: ""
                    };
                    const descriptions = function () {
                    };
                    util.storeMetaData(metaData, fakePath, descriptions);
                    expect(outputJsonSpy).toHaveBeenCalledWith(fakePath, metaData);
                });

                it('joins descriptions into single description line in metaData', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/outfile.json";
                    const outputJsonSpy = spyOn(fse, 'outputJsonSync').and.stub();
                    const metaData = {
                        description: ""
                    };
                    const descriptions = ["description 1", "description 2"];
                    util.storeMetaData(metaData, fakePath, descriptions);
                    expect(outputJsonSpy).toHaveBeenCalledWith(fakePath, metaData);
                    expect(metaData.description.length).toBeGreaterThan(0);
                    expect(metaData.description).toEqual("description 1|description 2");
                });

                it('ignores null descriptions in description in array', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/outfile.json";
                    const outputJsonSpy = spyOn(fse, 'outputJsonSync').and.stub();
                    const metaData = {
                        description: ""
                    };
                    const descriptions = ["description 1", null, "description 2"];
                    util.storeMetaData(metaData, fakePath, descriptions);
                    expect(outputJsonSpy).toHaveBeenCalledWith(fakePath, metaData);
                    expect(metaData.description.length).toBeGreaterThan(0);
                    expect(metaData.description).toEqual("description 1|description 2");
                });
                it('ignores undefined descriptions in description in array', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/outfile.json";
                    const outputJsonSpy = spyOn(fse, 'outputJsonSync').and.stub();
                    const metaData = {
                        description: ""
                    };
                    const descriptions = ["description 1", undefined, "description 2"];
                    util.storeMetaData(metaData, fakePath, descriptions);
                    expect(outputJsonSpy).toHaveBeenCalledWith(fakePath, metaData);
                    expect(metaData.description.length).toBeGreaterThan(0);
                    expect(metaData.description).toEqual("description 1|description 2");
                });

            });

        }); // store metaData

        describe('addMetaData', () => {

            describe('crash scenarios', () => {

                it('crashes if baseName is undefined', () => {
                    spyOn(console, 'error').and.stub();
                    expect(() => {
                        util.addMetaData({}, undefined, undefined);
                    }).toThrow();

                });
            });

            describe('working scenarios', () => {


                it('writes contents to target file with no lock file', () => {
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();
                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith("combined.json")) {
                            return false;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.returnValue(
                        function () {
                            this.toString = function () {
                                return "";
                            };
                        }
                    );
                    spyOn(fs, 'createWriteStream').and.returnValue({
                        write: jasmine.createSpy('write'),
                        end: jasmine.createSpy('end')
                    });

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = {};
                    const options = {
                        docName: "report.html",
                        sortFunction: defaultSortFunction
                    };
                    util.addMetaData(metaData, fakePath, options);
                    expect(console.error).not.toHaveBeenCalled();
                });


                it('writes contents to target file with preexisting file', () => {
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.returnValue(
                        function () {
                            this.toString = function () {
                                return "";
                            };
                        }
                    );
                    spyOn(fs, 'createWriteStream').and.returnValue({
                        write: jasmine.createSpy('write'),
                        end: jasmine.createSpy('end')
                    });

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = {};
                    const options = {
                        docName: "report.html",
                        sortFunction: defaultSortFunction
                    };
                    util.addMetaData(metaData, fakePath, options);

                    expect(console.error).not.toHaveBeenCalled();
                });

                it('checks that stringifyed content is as expected', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";
                    const metaData1 = { 'first' : 'value1' };
                    const metaData2 = {
                        'second': 'value2',
                        'embed':
                            {
                                'embedded': 'innerValue',
                                'embedded2': 'innerValue2'
                            }
                    };
                    let step = 0;

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        step ++;
                        switch (step) {
                            case 1:
                                return "[]";
                            case 2:
                                return "[" + JSON.stringify(metaData1) + "]";
                            default:
                                fail('Unexpected step');
                        }
                    });

                    let step1RegisteredMetaData = '';
                    let step2RegisteredMetaData = '';
                    spyOn(fse, "outputJsonSync").and.callFake((fpath, stringifyedContent) => {
                        switch (step) {
                            case 1:
                                step1RegisteredMetaData = stringifyedContent;
                                break;
                            case 2:
                                step2RegisteredMetaData = stringifyedContent;
                                break;
                            default:
                                fail('Unexpected step');
                        }
                    });

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        return true;
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.returnValue(
                        function () {
                            this.toString = function () {
                                return "";
                            };
                        }
                    );
                    spyOn(fs, 'createWriteStream').and.returnValue({
                        write: jasmine.createSpy('write'),
                        end: jasmine.createSpy('end')
                    });

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const options = {
                        docName: "report.html",
                        sortFunction: defaultSortFunction
                    };

                    // Add meta data twice to ensure they are aggregated
                    util.addMetaData(metaData1, fakePath, options);
                    util.addMetaData(metaData2, fakePath, options);

                    expect(console.error).not.toHaveBeenCalled();
                    expect(step1RegisteredMetaData).toBe('[{"first":"value1"}]');
                    expect(step2RegisteredMetaData).toBe('[{"first":"value1"},{"second":"value2","embed":{"embedded":"innerValue","embedded2":"innerValue2"}}]');
                });

            });

        });

        describe('addHTMLReport (called by addMetaData', () => {

            describe('crash scenarios', () => {
                it('logs to console when file operations crash', () => {
                    const htmlTemplate = '<!-- Here will be CSS placed -->';
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake(() => {
                        return Buffer.from(htmlTemplate);
                    });


                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        throw new Error("Weird Error writing file");
                    });

                    spyOn(fs,'copyFileSync').and.stub();

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = {};
                    const options = {
                        docName: "report.html",
                        sortFunction: defaultSortFunction,
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);

                    expect(console.error).toHaveBeenCalledWith(new Error("Weird Error writing file"));
                });
            });

            describe('working scenarios', () => {

                it('replaces stylesheet in template addHTMLReport', () => {
                    const htmlTemplate = '<!-- Here will be CSS placed -->';
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake(() => {
                        return Buffer.from(htmlTemplate);
                    });

                    let htmlContents;
                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        if (wfile.endsWith(".html")) {
                            return {
                                write: function (txt) {
                                    htmlContents = txt;
                                },
                                end: jasmine.createSpy('end')
                            };
                        }
                        return {
                            write: jasmine.createSpy('write'),
                            end: jasmine.createSpy('end')
                        };

                    });

                    spyOn(fs,'copyFileSync').and.stub();

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = {};
                    const options = {
                        docName: "report.html",
                        sortFunction: defaultSortFunction,
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);

                    expect(console.error).not.toHaveBeenCalled();
                    expect(htmlContents).toEqual('<link rel=\"stylesheet\" href=\"assets\/bootstrap.css\">');
                });

                it('replaces stylesheet with custom file in template addHTMLReport', () => {
                    const htmlTemplate = '<!-- Here will be CSS placed -->';
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake(() => {
                        return Buffer.from(htmlTemplate);
                    });

                    let htmlContents;
                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        if (wfile.endsWith(".html")) {
                            return {
                                write: function (txt) {
                                    htmlContents = txt;
                                },
                                end: jasmine.createSpy('end')
                            };
                        }
                        return {
                            write: jasmine.createSpy('write'),
                            end: jasmine.createSpy('end')
                        };

                    });

                    spyOn(fs,'copyFileSync').and.stub();


                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = {};
                    const options = {
                        docName: "report.html",
                        sortFunction: defaultSortFunction,
                        cssOverrideFile: "my-super-custom.css",
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);

                    expect(console.error).not.toHaveBeenCalled();
                    expect(htmlContents).toEqual('<link rel=\"stylesheet\" href=\"my-super-custom.css\">');
                });

                it('replaces title with options.docTitle in addHTMLReport', () => {
                    const htmlTemplate = '<!-- Here will be CSS placed --> <!-- Here goes title -->';
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake(() => {
                        return Buffer.from(htmlTemplate);
                    });

                    let htmlContents;
                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        if (wfile.endsWith(".html")) {
                            return {
                                write: function (txt) {
                                    htmlContents = txt;
                                },
                                end: jasmine.createSpy('end')
                            };
                        }
                        return {
                            write: jasmine.createSpy('write'),
                            end: jasmine.createSpy('end')
                        };

                    });

                    spyOn(fs,'copyFileSync').and.stub();

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = {};
                    const options = {
                        docName: "report.html",
                        docTitle: "my super fance document title",
                        sortFunction: defaultSortFunction,
                        cssOverrideFile: "my-super-custom.css",
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);

                    expect(console.error).not.toHaveBeenCalled();
                    expect(htmlContents).toEqual('<link rel=\"stylesheet\" href=\"my-super-custom.css\"> my super fance document title');
                });

                it('replaces results in app.js', () => {
                    let jsTemplate = "    var results = [];//'<Results Replacement>';   ";

                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake(() => {
                        return Buffer.from(jsTemplate);
                    });

                    let jsContents;
                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        if (wfile.endsWith(".js")) {
                            return {
                                write: function (txt) {
                                    jsContents = txt;
                                },
                                end: jasmine.createSpy('end')
                            };
                        }
                        return {
                            write: jasmine.createSpy('write'),
                            end: jasmine.createSpy('end')
                        };

                    });

                    spyOn(fs,'copyFileSync').and.stub();

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = testResults[0];
                    //fs.writeFileSync(dbgFile,JSON.stringify(metaData,null,4),'utf-8');
                    const options = {
                        docName: "report.html",
                        docTitle: "my super fance document title",
                        sortFunction: defaultSortFunction,
                        cssOverrideFile: "my-super-custom.css",
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);
                    expect(console.error).not.toHaveBeenCalled();
                    expect(jsContents.length).toEqual(1920);


                });

                it('replaces results with [] clientDefaults.useAjax is true in app.js', () => {
                        const jsTemplate = "    var results = [];//'<Results Replacement>';  ";
                        const errorMsg = "mock case not expected: ";
                        const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                        //region mocks

                        // for addMetaData
                        spyOn(fse, "ensureFileSync").and.stub();
                        spyOn(fs, "rmdirSync").and.stub();
                        spyOn(fs, "mkdirSync").and.stub();
                        spyOn(fse, "readJsonSync").and.callFake(() => {
                            return "[]";
                        });
                        spyOn(fse, "outputJsonSync").and.stub();

                        spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                            if (fpath.endsWith(".lock")) {
                                return false;
                            }
                            if (fpath.endsWith("combined.json")) {
                                return true;
                            }
                            throw new Error(errorMsg + fpath);
                        });

                        // for addHTMLReport
                        spyOn(fse, 'copySync').and.stub();
                        spyOn(fs, 'readFileSync').and.callFake(() => {
                            return Buffer.from(jsTemplate);
                        });

                        let jsContents;
                        spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                            if (wfile.endsWith(".js")) {
                                return {
                                    write: function (txt) {
                                        jsContents = txt;
                                    },
                                    end: jasmine.createSpy('end')
                                };
                            }
                            return {
                                write: jasmine.createSpy('write'),
                                end: jasmine.createSpy('end')
                            };

                        });

                        spyOn(fs,'copyFileSync').and.stub();

                    // misc
                        spyOn(console, 'error').and.stub();
                        //end region mocks

                        const metaData = testResults[0];
                        const options = {
                            docName: "report.html",
                            docTitle: "my super fance document title",
                            sortFunction: defaultSortFunction,
                            clientDefaults: {
                                useAjax: true
                            }
                        };
                        util.addMetaData(metaData, fakePath, options);

                        expect(console.error).not.toHaveBeenCalled();
                        expect(jsContents).toEqual('    var results = [];  ');
                    });


                it('replaces sortfunction in app.js', () => {
                    const jsTemplate = "        this.results = results.sort(defaultSortFunction/*<Sort Function Replacement>*/);  ";
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake(() => {
                        return Buffer.from(jsTemplate);
                    });

                    let jsContents;
                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        if (wfile.endsWith(".js")) {
                            return {
                                write: function (txt) {
                                    jsContents = txt;
                                },
                                end: jasmine.createSpy('end')
                            };
                        }
                        return {
                            write: jasmine.createSpy('write'),
                            end: jasmine.createSpy('end')
                        };

                    });

                    spyOn(fs,'copyFileSync').and.stub();

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = testResults[0];
                    const options = {
                        docName: "report.html",
                        docTitle: "my super fance document title",
                        sortFunction: defaultSortFunction,
                        cssOverrideFile: "my-super-custom.css",
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);

                    expect(console.error).not.toHaveBeenCalled();
                    expect(jsContents).not.toContain('<Sort Function Replacement>')
                    expect(/results\.sort\(/.test(jsContents)).toBeTruthy();
                });
                //}


                it('replaces clientDefaults in app.js', () => {
                        const jsTemplate = "    var clientDefaults = {};//'<Client Defaults Replacement>';  ";
                        const errorMsg = "mock case not expected: ";
                        const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                        //region mocks

                        // for addMetaData
                        spyOn(fse, "ensureFileSync").and.stub();
                        spyOn(fs, "rmdirSync").and.stub();
                        spyOn(fs, "mkdirSync").and.stub();
                        spyOn(fse, "readJsonSync").and.callFake(() => {
                            return "[]";
                        });
                        spyOn(fse, "outputJsonSync").and.stub();

                        spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                            if (fpath.endsWith(".lock")) {
                                return false;
                            }
                            if (fpath.endsWith("combined.json")) {
                                return true;
                            }
                            throw new Error(errorMsg + fpath);
                        });

                        // for addHTMLReport
                        spyOn(fse, 'copySync').and.stub();
                        spyOn(fs, 'readFileSync').and.callFake(() => {
                            return Buffer.from(jsTemplate);
                        });

                        let jsContents;
                        spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                            if (wfile.endsWith(".js")) {
                                return {
                                    write: function (txt) {
                                        jsContents = txt;
                                    },
                                    end: jasmine.createSpy('end')
                                };
                            }
                            return {
                                write: jasmine.createSpy('write'),
                                end: jasmine.createSpy('end')
                            };

                        });

                        spyOn(fs,'copyFileSync').and.stub();

                        // misc
                        spyOn(console, 'error').and.stub();
                        //end region mocks

                        const metaData = testResults[0];
                        const options = {
                            docName: "report.html",
                            docTitle: "my super fance document title",
                            sortFunction: defaultSortFunction,
                            clientDefaults: {
                                searchSettings: {},
                                columnSettings: {}
                            },
                            prepareAssets: true
                        };
                        util.addMetaData(metaData, fakePath, options);

                        expect(console.error).not.toHaveBeenCalled();
                        const jsContentsWoLF = jsContents.replace(/\r\n/g, "").replace(/\n/g, "");
                        expect(jsContentsWoLF).toEqual('    var clientDefaults = {    "searchSettings": {},    "columnSettings": {}};  ');
                    });

                it('replaces templates in app.js', () => {
                    const jsTemplate = "         //'<templates replacement>';  ";
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake((fpath) => {
                        if (fpath.endsWith("app.js")) {
                            return Buffer.from(jsTemplate);
                        }
                        if(fpath.endsWith("pbr-screenshot-modal.html")){
                            return Buffer.from("<screenshotmodal></screenshotmodal>");
                        }
                        if(fpath.endsWith("pbr-stack-modal.html")){
                            return Buffer.from("<stackmodal></stackmodal>");
                        }
                        if(fpath.endsWith("index.html")){
                            return "";//not interseted in index in this test
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    let jsContents;
                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        if (wfile.endsWith(".js")) {
                            return {
                                write: function (txt) {
                                    jsContents = txt;
                                },
                                end: jasmine.createSpy('end')
                            };
                        }
                        return {
                            write: jasmine.createSpy('write'),
                            end: jasmine.createSpy('end')
                        };

                    });

                    spyOn(fs,'copyFileSync').and.stub();

                    // misc
                    var errout="";
                    spyOn(console, 'error').and.callFake((e)=>{
                       errout+=e.toString()+"\r\n";
                    });
                    //end region mocks

                    const metaData = testResults[0];
                    const options = {
                        docName: "report.html",
                        docTitle: "my super fance document title",
                        sortFunction: defaultSortFunction,
                        cssOverrideFile: "my-super-custom.css",
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);
                    //expect(errout).toEqual(""); //needed only when test fails
                    expect(console.error).not.toHaveBeenCalled();
                    expect(jsContents).not.toContain("//'<templates replacement>';");
                    expect(jsContents).toContain("<screenshotmodal></screenshotmodal>");
                    expect(jsContents).toContain("<stackmodal></stackmodal>");

                });
                //}

                it('copies templates when useAjax is on', () => {
                    const jsTemplate = "         //'<templates replacement>';  ";
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    spyOn(fs, "mkdirSync").and.stub();
                    spyOn(fse, "readJsonSync").and.callFake(() => {
                        return "[]";
                    });
                    spyOn(fse, "outputJsonSync").and.stub();

                    spyOn(fse, 'pathExistsSync').and.callFake((fpath) => {
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
                        if (fpath.endsWith("combined.json")) {
                            return true;
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    // for addHTMLReport
                    spyOn(fse, 'copySync').and.stub();
                    spyOn(fs, 'readFileSync').and.callFake((fpath) => {
                        if (fpath.endsWith("app.js")) {
                            return Buffer.from(jsTemplate);
                        }
                        // if(fpath.endsWith("pbr-screenshot-modal.html")){
                        //     return Buffer.from("<screenshotmodal></screenshotmodal>");
                        // }
                        // if(fpath.endsWith("pbr-stack-modal.html")){
                        //     return Buffer.from("<stackmodal></stackmodal>");
                        // }
                        if(fpath.endsWith("index.html")){
                            return "";//not interseted in index in this test
                        }
                        throw new Error(errorMsg + fpath);
                    });

                    let jsContents;
                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        if (wfile.endsWith(".js")) {
                            return {
                                write: function (txt) {
                                    jsContents = txt;
                                },
                                end: jasmine.createSpy('end')
                            };
                        }
                        return {
                            write: jasmine.createSpy('write'),
                            end: jasmine.createSpy('end')
                        };

                    });

                    spyOn(fs,'copyFileSync').and.stub();

                    // misc
                    var errout="";
                    spyOn(console, 'error').and.callFake((e)=>{
                        errout+=e.toString()+"\r\n";
                    });
                    //end region mocks

                    const metaData = testResults[0];
                    const options = {
                        docName: "report.html",
                        docTitle: "my super fance document title",
                        sortFunction: defaultSortFunction,
                        cssOverrideFile: "my-super-custom.css",
                        prepareAssets: true,
                        clientDefaults:{
                            useAjax:true
                        }
                    };
                    util.addMetaData(metaData, fakePath, options);
                    //expect(errout).toEqual(""); //needed only when test fails
                    expect(console.error).not.toHaveBeenCalled();

                    expect(jsContents).not.toContain("//'<templates replacement>';");
                    // prepare async matcher
                    var isTemplateFile={
                        asymmetricMatch: function(actual) {
                            //we match only the beginning of the warning because the end is a link that changes between angular versions
                            return actual && /\.html$/.test(actual);
                        }
                    };
                    // copied things?
                    //expect(fs.copyFileSync).toHaveBeenCalledWith(isTemplateFile);
                    var fsCopyArgfs=fs.copyFileSync.calls.allArgs();
                    expect(fsCopyArgfs.length).toEqual(2);
                    //check if the first argument was a template file
                    expect(fsCopyArgfs[0][0]).toEqual(isTemplateFile);
                    expect(fsCopyArgfs[1][0]).toEqual(isTemplateFile);
                    // we copied the templates so the should not be in the javascript
                    expect(jsContents).not.toContain("<screenshotmodal></screenshotmodal>");
                    expect(jsContents).not.toContain("<stackmodal></stackmodal>");

                });
                //}


            });

        });

    });


});
