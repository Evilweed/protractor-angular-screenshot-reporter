# Changelog

## Version 1.2.6
* Fixed: Reporter not working in Internet Explorer
* Improved: Minds newlines in messages with callstacks
* Optional: Load test results via ajax instead of patching app.js

## Version 1.2.5
* Fixed: Shows only first "except" failure even if there were more than one
* Fixed: Tooltips in top bargraph did not show up on mousehover
* Fixed: Small numbers in top bargraph where clipped if the perecentage was too low

## Version 1.2.4
* Customize default search settings
* Customize default column settings

## Version 1.2.3
* All buttons should now work
* Warning sign now should be visible
* Progress bar counter should be working as well

## Version 1.2.2
* Updated outdated and vulnerable JQuery and Angular dependencies.
* Removed loading JS from external source (button.js) to improve security. Now it's under assets.
* Updated HTML, JS and CSS to be more compatible with strict content-security-policy. (e.g. Jenkins default CSP now only requires a more reasonable change)

## Version 1.2.1
* Improved look of generated report

## Version 1.2.0
* Improved speed
* Fixed issue with status bar on IE
* Grouping tests per browser in sharded runs

## Version 1.1.1
* Added Github link

## Version 1.1.0
* Compiled app to ES5

## Version 1.0.3
* Added option to skip disabled specs

## Version 1.0.2
* Fix for missing glyph-icons
* Fix for missing css caused by cross-origin

## Version 1.0.1
* Bundled assets into report

## Version 0.5.8
* Added option to change sort function

## Version 0.5.7
* Fixed last spec not being saved
* Fixed pending specs not being saved

## Version 0.5.6
* Saving timestamp of test cases

## Version 0.5.5
* Fixed docTitle option

## Version 0.5.4
* Fixed cssOverrideFile option

## Version 0.5.3
* Fixed issue with undefined describe

## Version 0.5.2
* Fixed performance issue and stability. PR by yjaaidi
* Added test sorting for sharded runs

## Version 0.5.1
* Updated CSS link
* Added CSS file to the repo for later use
* Fixed issue with errors in logs because of missing images
* Fixed gatherBrowserLogs option definition

## Version 0.5.0
* Better error handling for Jasmine 2

## Version 0.4.8
* Improved displaying of spec names

## Version 0.4.7
* Fixed issue where last pending test case was not added to report
* Fixed crash on gathering Logs from Browsers other than Chrome
* Added optional parameter gatherBrowserLogs
* Improved speed of tests (tries to take screenshot only when needed)
* Fixed displaying of Duration time
* Made all disabled test cases to be included in report as Pending

## Version 0.4.6
* Fixed issue where last test case was not added to report due error in browser's log gathering (fix for Jasmine 2, in Jasmine 1 issue still exists)

## Version 0.4.5
* Fixed gathering of duration for Non-Typescript users
* Added coloring for duration that is longer than 14 and 29 seconds

## Version 0.4.4
* Added missing function call for counting log entries

## Version 0.4.3
* Disabled sym-link for enterprise users

## Version 0.4.2
* Added counting browser log entries
* Added displaying separate counts for SEVERE and WARNING log per each test case

## Version 0.4.0
* Added Duration column for test cases (Jasmine2 only)
* Replaced MORE OPTIONS button with separate button for each column
* Improved readability of test cases
* Added numbers of passed/failed/pending test cases to chart

## Version 0.3.4
* Added Toggle Button to for Suspected Line Highlight
* Improved Suspected Line Highlight in Stack Trace

## Version 0.3.3
* Improved Suspected Line Highlight in Stack Trace
* Replaced old Examples with new ones

## Version 0.3.2
* Added support for multiline Browser Logs
* Fixed label formatting for Warning Log
* Fixed label formatting for Default Log

## Version 0.3.1
* Fixed critical bug with storing Browser's Log

## Version 0.3.0
* Added storing Browser's Logs
* Added filter for displaying Test Cases that contain Browser Logs
* Replaced text statuses with icons
* Replaced text buttons of Stack Trace and Browser's Log with icons
* Changed color of Suspected Lines in Stack Trace
* Improved table sizing

## Version 0.2.3
* Added optional screenshotsSubfolder and jsonsSubfolder

## Version 0.2.2
* Moved suspectedLine logic to Frontend

## Version 0.2.1
* Added missing suspectedLine to Jasmine2

## Version 0.2.0
* Stack Trace (added suspected line highlight)
* Added Prev/Next buttons for Screenshots
* Fuzzy Search
* Filters (can display only Passed/Failed/Pending)
* Inline Screenshots
* Details (Browser/Session ID/OS)

## Version 0.0.1
* Initial release
