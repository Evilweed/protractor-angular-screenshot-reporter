const util = require('../../app/util');
const fs = require('fs');
const fse = require('fs-extra');

const testResults = require('./test_data');

const defaultSortFunction = (a, b) => {
    return (a + b) ? 0 : 0; //
};

const oldVersion = false; // upcoming need different handling of replacesments

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

                it('catches error and logs if param pathExists throws', () => {
                    const errorMsg = "fake error";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";
                    spyOn(fse, 'pathExistsSync').and.callFake(() => {
                        throw new Error(errorMsg);
                    });
                    spyOn(console, 'error').and.stub();
                    util.addMetaData({}, fakePath, {});
                    expect(console.error).toHaveBeenCalledWith(new Error(errorMsg));
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
                        if (fpath.endsWith(".lock")) {
                            return false;
                        }
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
                        return new Buffer(htmlTemplate);
                    });


                    spyOn(fs, 'createWriteStream').and.callFake((wfile) => {
                        throw new Error("Weird Error writing file");
                    });

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
                        return new Buffer(htmlTemplate);
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
                        return new Buffer(htmlTemplate);
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
                        return new Buffer(htmlTemplate);
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
                    if (oldVersion) {
                        jsTemplate = "    var results = '<Results Replacement>';";
                    }

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
                        return new Buffer(jsTemplate);
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
                    if (oldVersion) {
                        expect(jsContents.length).toEqual(15475);
                    } else {
                        //fs.writeFileSync(dbgFile,jsContents,'utf-8');
                        expect(jsContents.length).toEqual(1920);
                    }

                });
                if (!oldVersion) { // use ajax not yet implemwented
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
                            return new Buffer(jsTemplate);
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
                }

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
                        return new Buffer(jsTemplate);
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

                if (!oldVersion) {
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
                            return new Buffer(jsTemplate);
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
                } else {
                    it('replaces columnsettings in app.js with defaults', () => {
                        const jsTemplate = "    var initialColumnSettings = '<Column Settings Replacement>'" +
                            "; // enable customisation of visible columns on first page hit";
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
                            return new Buffer(jsTemplate);
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

                        // misc
                        spyOn(console, 'error').and.stub();
                        //end region mocks

                        const metaData = testResults[0];
                        const options = {
                            docName: "report.html",
                            docTitle: "my super fance document title",
                            sortFunction: defaultSortFunction,
                            prepareAssets: true
                        };
                        util.addMetaData(metaData, fakePath, options);

                        expect(console.error).not.toHaveBeenCalled();
                        expect(/'<Column Settings Replacement>'/.test(jsContents)).toBeFalsy();
                        expect(/=[ ]*undefined/.test(jsContents)).toBeTruthy("columnSettings should be undefined");
                    });

                    it('replaces columnsettings in app.js with options', () => {
                        const jsTemplate = "    var initialColumnSettings = '<Column Settings Replacement>'" +
                            "; // enable customisation of visible columns on first page hit";
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
                            return new Buffer(jsTemplate);
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

                        // misc
                        spyOn(console, 'error').and.stub();
                        //end region mocks

                        const metaData = testResults[0];
                        const options = {
                            docName: "report.html",
                            docTitle: "my super fance document title",
                            sortFunction: defaultSortFunction,
                            columnSettings: {
                                displayTime: true,
                                displayBrowser: false,
                                displaySessionId: true,
                                inlineScreenshots: false
                            },
                            prepareAssets: true
                        };
                        util.addMetaData(metaData, fakePath, options);

                        expect(console.error).not.toHaveBeenCalled();
                        expect(jsContents).toBeDefined();
                        expect(/'<Column Settings Replacement>'/.test(jsContents)).toBeFalsy();
                        let match = /var initialColumnSettings[ ]*=[ ]*([^;]+);/.exec(jsContents);
                        expect(match).toBeDefined();
                        let extrSettings = match[1];
                        expect(extrSettings).toEqual(
                            '{"displayTime":true,"displayBrowser":false,"displaySessionId":true,"inlineScreenshots":false}'
                        );
                    });

                    it('replaces searchSettings in app.js with defaults', () => {
                        const jsTemplate = "}, '<Search Settings Replacement>'); " +
                            "// enable customisation of search settings on first page hit";
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
                            return new Buffer(jsTemplate);
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

                        // misc
                        spyOn(console, 'error').and.stub();
                        //end region mocks

                        const metaData = testResults[0];
                        const options = {
                            docName: "report.html",
                            docTitle: "my super fance document title",
                            sortFunction: defaultSortFunction,
                            prepareAssets: true
                        };
                        util.addMetaData(metaData, fakePath, options);

                        expect(console.error).not.toHaveBeenCalled();
                        expect(/'<Search Settings Replacement>'/.test(jsContents)).toBeFalsy("placeholders not replaced");
                        expect(/\{\}/.test(jsContents)).toBeTruthy("didt not find {} as replacement");
                    });

                    it('replaces searchSettings in app.js with options', () => {
                        const jsTemplate = "\}, '<Search Settings Replacement>'); " +
                            "// enable customisation of search settings on first page hit";
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
                            return new Buffer(jsTemplate);
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

                        // misc
                        spyOn(console, 'error').and.stub();
                        //end region mocks

                        const metaData = testResults;
                        const options = {
                            docName: "report.html",
                            docTitle: "my super fance document title",
                            sortFunction: defaultSortFunction,
                            searchSettings: {
                                allselected: false,
                                passed: false,
                                failed: false,
                                pending: true,
                                withLog: true
                            },
                            prepareAssets: true
                        };
                        util.addMetaData(metaData, fakePath, options);

                        expect(console.error).not.toHaveBeenCalled();
                        expect(/'<Search Settings Replacement>'/.test(jsContents)).toBeFalsy("placeholders not replaced");
                        let match = /\}[ ]*,[ ]*([^;]+);/.exec(jsContents);
                        expect(match).toBeDefined();
                        let extrSettings = match[1];
                        expect(extrSettings).toEqual(
                            '{"allselected":false,"passed":false,"failed":false,"pending":true,"withLog":true})'
                        );
                    });
                }
            });

        });

    });


});
