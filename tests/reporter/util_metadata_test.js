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

                it('catches error and logs if mkdirSync throws', () => {
                    const errorMsg = "fake error";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";
                    spyOn(fs, 'mkdirSync').and.callFake(() => {
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

                it('retries when locked and writes contents to target file with preexisting file ', () => {
                    const errorMsg = "mock case not expected: ";
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";

                    function makeFEXISTErr() {
                        const errorMsg = `EEXIST: file already exists, mkdir '${fakePath}'`;
                        let err = new Error(errorMsg);
                        err.code = "EEXIST";
                        return err;
                    }

                    //region mocks

                    // for addMetaData
                    spyOn(fse, "ensureFileSync").and.stub();
                    spyOn(fs, "rmdirSync").and.stub();
                    let times = 0;
                    spyOn(fs, "mkdirSync").and.callFake(() => {
                        times++;
                        if (times === 1) {
                            throw makeFEXISTErr();
                        }
                    });
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


                    spyOn(fs, 'createWriteStream').and.callFake(() => {
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

                    // fs.writeFileSync(dbgFile,jsContents,'utf-8');
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
                    expect(jsContents).not.toContain('<Sort Function Replacement>');
                    expect(/results\.sort\(/.test(jsContents)).toBeTruthy();
                });

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

                it('adds customCssInline if configured so', () => {
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

                    // misc
                    spyOn(console, 'error').and.stub();
                    //end region mocks

                    const metaData = {};
                    const options = {
                        docName: "report.html",
                        sortFunction: defaultSortFunction,
                        customCssInline: ".myspecial-custom-class { font-face: bold; }",
                        prepareAssets: true
                    };
                    util.addMetaData(metaData, fakePath, options);

                    expect(console.error).not.toHaveBeenCalled();
                    expect(htmlContents).toEqual('<link rel="stylesheet" href="assets/bootstrap.css"> <style type="text/css">.myspecial-custom-class { font-face: bold; }</style>');
                });
            });

        });

    });


});
