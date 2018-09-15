var referenceTestResults = results;
var testDataBackup;
var tzOffset = new Date().getTimezoneOffset();
describe('unit tests', function () {
    describe('reportingApp', function () {

        beforeEach(function () {
            module("reportingApp");
        });
        var $controller;
        var $rootScope;
        beforeEach(inject(function (_$controller_, _$rootScope_) {
            $controller = _$controller_;
            $rootScope = _$rootScope_;
        }));
        describe('ScreenshotReportController', function () {
            describe("core functions", function () {

                it('can be instantiated with errors', function () {
                    var $scope = $rootScope.$new();
                    expect($scope).toBeDefined();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    expect(controller).toBeDefined();
                });

                it('searchSettings are defined', function () {
                    var $scope = $rootScope.$new();
                    expect($scope).toBeDefined();
                    $controller('ScreenshotReportController', {$scope: $scope});
                    expect($scope.searchSettings).toBeDefined();
                });

                it('chooseAllTypes inverts selection', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    $scope.searchSettings.allselected = false;
                    $scope.searchSettings.passed = false;
                    $scope.searchSettings.failed = false;
                    $scope.searchSettings.pending = false;
                    $scope.searchSettings.withLog = false;
                    controller.chooseAllTypes();
                    expect($scope.searchSettings.allselected).toBeTruthy();
                    controller.chooseAllTypes();
                    expect($scope.searchSettings.allselected).toBeFalsy();
                });

                it('isArray detects only real arrays', function () {
                    var controller = $controller('ScreenshotReportController', {$scope: {}});
                    var nuul = null;
                    var boool = true;
                    var nuumber = 1;
                    var oobject = {};
                    var aarray = [];
                    expect(controller.isValueAnArray(undefined)).toBeFalsy();
                    expect(controller.isValueAnArray(nuul)).toBeFalsy();
                    expect(controller.isValueAnArray(boool)).toBeFalsy();
                    expect(controller.isValueAnArray(nuumber)).toBeFalsy();
                    expect(controller.isValueAnArray(oobject)).toBeFalsy();
                    expect(controller.isValueAnArray(aarray)).toBeTruthy();
                });

                it('round is robust against initial values like undefined or null', function () {
                    var controller = $controller('ScreenshotReportController', {$scope: {}});
                    //the round function devides by 1000 to get from milliseconds to seconds
                    expect(controller.round(null)).toEqual('NaN');
                    expect(controller.round(undefined)).toEqual('NaN');
                    expect(controller.round('null')).toEqual('NaN');
                    expect(controller.round('undefined')).toEqual('NaN');
                    expect(controller.round('abc')).toEqual('NaN');
                    expect(controller.round('.abc')).toEqual('NaN');
                    expect(controller.round('')).toEqual('NaN');
                    expect(controller.round('0')).toEqual('0');
                    expect(controller.round('0.0')).toEqual('0');
                    expect(controller.round('0.1')).toEqual('0');
                    expect(controller.round('0.9')).toEqual('0');
                    expect(controller.round('0')).toEqual('0', 3);
                    expect(controller.round('0.0')).toEqual('0', 3);
                });

                it('round converts milliseconds to seconds as expected', function () {
                    var controller = $controller('ScreenshotReportController', {$scope: {}});
                    //the round function devides by 1000 to get from milliseconds to seconds
                    expect(controller.round('1000')).toEqual('1');
                    expect(controller.round('1000.9999')).toEqual('1');
                    expect(controller.round('1000.9999', 1)).toEqual('1.0');
                    expect(controller.round('1100.9999', 1)).toEqual('1.1');
                    expect(controller.round('1190.9999', 2)).toEqual('1.19');
                    expect(controller.round('9880.9999', 3)).toEqual('9.881');
                });

                it('convertTimestamp handles all AM/PM cases in TZ ' + tzOffset, function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});

                    expect(timeData).toBeDefined();
                    var refSet = timeData[tzOffset]; // timezoneoffset
                    expect(refSet).toBeDefined("No reference data for timezoneOffset " + tzOffset);
                    expect(controller.convertTimestamp(1534696710055)).toEqual(refSet["1534696710055"]); // 2018-08-19, 6:38 PM
                    expect(controller.convertTimestamp(1534396700055)).toEqual(refSet["1534396700055"]); // e.g. "2018-08-16, 7:18 AM"
                    expect(controller.convertTimestamp(1543618800000)).toEqual(refSet["1543618800000"]); //e.g. "2018-12-01, 12:00 AM"
                    expect(controller.convertTimestamp(1543662000000)).toEqual(refSet["1543662000000"]);  // e.g. "2018-12-01, 12:00 PM");

                });

            });

            describe("nesting detecting", function () {

                it('testData are present and sane', function () {
                    //global variable defined in test_data.js
                    expect(referenceTestResults).toBeDefined();
                    expect(referenceTestResults.length).toBeGreaterThan(0);
                });

                it('level 2 descriptions in testData are found', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    var parents = [];
                    for (var i = 0; i < referenceTestResults.length; i++) {
                        var resultDesc = referenceTestResults[i].description;
                        if (resultDesc) {
                            var parentDesc = controller.getParent(resultDesc);
                            if (parentDesc) {
                                parents.push(parentDesc);
                            } else {
                                parents.push('[no parent]');
                            }
                        }
                    }

                    expect(parents.length).toEqual(12);

                    expect(parents[0]).toEqual("[no parent]");
                    expect(parents[1]).toEqual("[no parent]");
                    expect(parents[2]).toEqual("[no parent]");
                    expect(parents[3]).toEqual("todo list");
                    expect(parents[4]).toEqual("todo list");
                    expect(parents[5]).toEqual("todo list");
                    expect(parents[6]).toEqual("todo list");
                    expect(parents[7]).toEqual("pending describe");
                    expect(parents[8]).toEqual("pending describe");
                });

                it('level 3+ descriptions are formatted correctly', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    expect(controller.getParent("a|b|c")).toEqual("b");
                    expect(controller.getParent("a|b|c|d")).toEqual("c > b");
                    expect(controller.getParent("a|b|c|d|e")).toEqual("d > c > b");
                });

                it('getShortDescription gets actual describe text', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    var shortDescs = [];
                    for (var i = 0; i < referenceTestResults.length; i++) {
                        var resultDesc = referenceTestResults[i].description;
                        if (resultDesc) {
                            var parentDesc = controller.getShortDescription(resultDesc);
                            if (parentDesc) {
                                shortDescs.push(parentDesc);
                            } else {
                                shortDescs.push('[no parent]');
                            }
                        }
                    }

                    expect(shortDescs.length).toEqual(12);

                    expect(shortDescs[0]).toEqual("should fail as greeting text is different");
                    expect(shortDescs[1]).toEqual("should greet the named user");
                    expect(shortDescs[2]).toEqual("should contain log and pretty stack trace");
                    expect(shortDescs[3]).toEqual("should list todos");
                    expect(shortDescs[4]).toEqual("should display first todo with proper text");
                    expect(shortDescs[5]).toEqual("should add a todo");
                    expect(shortDescs[6]).toEqual("should be displayed as pending test case");
                    expect(shortDescs[7]).toEqual("pending test case 1");
                    expect(shortDescs[8]).toEqual("pending test case 2");
                });

                it('getSpec gets always the top level describe text', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    var shortDescs = [];
                    for (var i = 0; i < referenceTestResults.length; i++) {
                        var resultDesc = referenceTestResults[i].description;
                        if (resultDesc) {
                            var parentDesc = controller.getSpec(resultDesc);
                            if (parentDesc) {
                                shortDescs.push(parentDesc);
                            } else {
                                shortDescs.push('[no parent]');
                            }
                        }
                    }

                    expect(shortDescs.length).toEqual(12);

                    expect(shortDescs[0]).toEqual("angularjs homepage");
                    expect(shortDescs[1]).toEqual("angularjs homepage");
                    expect(shortDescs[2]).toEqual("angularjs homepage");
                    expect(shortDescs[3]).toEqual("angularjs homepage");
                    expect(shortDescs[4]).toEqual("angularjs homepage");
                    expect(shortDescs[5]).toEqual("angularjs homepage");
                    expect(shortDescs[6]).toEqual("angularjs homepage");
                    expect(shortDescs[7]).toEqual("angularjs homepage");
                    expect(shortDescs[8]).toEqual("angularjs homepage");
                });
            });

            describe("reporting functions", function () {

                it('testData are present and sane', function () {
                    //global variable defined in test_data.js
                    expect(referenceTestResults).toBeDefined();
                    expect(referenceTestResults.length).toBeGreaterThan(0);
                });

                it('applySmartHighlight with node_modules line', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    var lineWithNodePath = referenceTestResults[2].trace[0];
                    expect(lineWithNodePath.indexOf("node_modules") > -1);
                    //applySmartHighlight is applied to stack trace lines
                    expect(controller.applySmartHighlight(lineWithNodePath)).toEqual("greyout");
                });

                it('applySmartHighlight with misc lines', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    var sampleTrace = referenceTestResults[0].trace[0].split("\n");
                    //applySmartHighlight is applied to stack trace lines
                    expect(controller.applySmartHighlight(sampleTrace[0])).toEqual("");
                    expect(controller.applySmartHighlight(sampleTrace[1])).toEqual("highlight"); //contains '  at '
                    expect(controller.applySmartHighlight(sampleTrace[2])).toEqual("greyout"); //contains node_modules
                });

                it('applySmartHighlight switched off with misc line', function () {
                    var $scope = $rootScope.$new();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    controller.showSmartStackTraceHighlight = false;
                    var sampleTrace = referenceTestResults[0].trace[0].split("\n");
                    //applySmartHighlight is applied to stack trace lines
                    expect(controller.applySmartHighlight(sampleTrace[0])).toEqual(true);
                    expect(controller.applySmartHighlight(sampleTrace[1])).toEqual(true); //contains '  at '
                    expect(controller.applySmartHighlight(sampleTrace[2])).toEqual(true); //contains node_modules
                });

                it('check counters', function () {
                    var $scope = $rootScope.$new();
                    expect($scope).toBeDefined();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    expect(controller.passCount()).toEqual(5);
                    expect(controller.pendingCount()).toEqual(4);
                    expect(controller.failCount()).toEqual(3);
                });

                it('check percents', function () {
                    var $scope = $rootScope.$new();
                    expect($scope).toBeDefined();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    expect(Math.trunc(controller.passPerc())).toEqual(41);
                    expect(Math.trunc(controller.pendingPerc())).toEqual(33);
                    expect(Math.trunc(controller.failPerc())).toEqual(25);
                });

                it('sortingFunctions', function () {
                    var $scope = $rootScope.$new();
                    expect($scope).toBeDefined();
                    var controller = $controller('ScreenshotReportController', {$scope: $scope});
                    controller.sortSpecs();
                });

            });
        });


    });
    describe('bySearchSettings filter', function () {

        beforeEach(function () {
            module("reportingApp");
        });
        var $filter;

        beforeEach(inject(function (_$filter_) {
            $filter = _$filter_;
        }));

        describe("works", function () {

            it('testData are present and sane', function () {
                //global variable defined in test_data.js
                expect(referenceTestResults).toBeDefined();
                expect(referenceTestResults.length).toBeGreaterThan(0);
            });

            it('shows all when allSelected', function () {
                var settings = {
                    description: '',
                    allselected: true,
                    passed: true,
                    failed: true,
                    pending: true,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(12);
            });

            it('shows only passed', function () {
                var settings = {
                    description: '',
                    allselected: false,
                    passed: true,
                    failed: false,
                    pending: false,
                    withLog: false
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(5);
            });

            it('shows passed OR withLog', function () {
                var settings = {
                    description: '',
                    allselected: false,
                    passed: true,
                    failed: false,
                    pending: false,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(6);
            });

            it('shows only failed', function () {
                var settings = {
                    description: '',
                    allselected: false,
                    passed: false,
                    failed: true,
                    pending: false,
                    withLog: false
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(3);
            });

            it('shows failed OR withLog', function () {
                var settings = {
                    description: '',
                    allselected: false,
                    passed: false,
                    failed: true,
                    pending: false,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(3);
            });


            it('shows only pending', function () {
                var settings = {
                    description: '',
                    allselected: false,
                    passed: false,
                    failed: false,
                    pending: true,
                    withLog: false
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(4);
            });

            it('shows only withLog', function () {
                var settings = {
                    description: '',
                    allselected: false,
                    passed: false,
                    failed: false,
                    pending: false,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(1);
            });

            it('filters by description', function () {
                var settings = {
                    description: 'should',
                    allselected: true,
                    passed: true,
                    failed: true,
                    pending: true,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(7);
            });

            it('filters by description2', function () {
                var settings = {
                    description: 'pending',
                    allselected: true,
                    passed: true,
                    failed: true,
                    pending: true,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(4);
            });


        });

        describe("does not crash", function () {

            beforeAll(function () {
                testDataBackup = referenceTestResults.slice();
            });
            afterEach(function () {
                referenceTestResults = testDataBackup.slice();
            });

            it('testDataBackup is ok', function () {
                expect(testDataBackup).toBeDefined();
                expect(testDataBackup.length).toEqual(12);
            });

            it('when test data is empty', function () {
                //global variable defined in test_data.js
                referenceTestResults = [];
                var settings = {
                    description: '',
                    allselected: true,
                    passed: true,
                    failed: true,
                    pending: true,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(0);
            });

            it('when test data is undefined', function () {
                //global variable defined in test_data.js
                referenceTestResults = undefined;
                var settings = {
                    description: '',
                    allselected: true,
                    passed: true,
                    failed: true,
                    pending: true,
                    withLog: true
                };
                var filter = $filter('bySearchSettings');
                var fResults = filter(referenceTestResults, settings);
                expect(fResults.length).toEqual(0);
            });

        });

    });

});
