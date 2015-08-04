'use strict';

angular.module('myApp', [/*'AxelSoft', */'ngRoute', 'jsTree.directive', /* 'ui.layout',*/ 'ui.bootstrap', 'ngSanitize',
  /*'btford.markdown',*/
  'highcharts-ng',
  'ng-showdown',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
]).
  config(function ($routeProvider, $locationProvider) {
    $routeProvider.
      when('/main', {
        templateUrl: 'public/views/main.html',
        controller: 'MainCtrl'
      }).
      otherwise({
        redirectTo: '/main'
      });

    //$locationProvider.html5Mode(true);
  })/*.
 config(['markdownConverterProvider', function (markdownConverterProvider) {
 // options to be passed to Showdown
 // see: https://github.com/coreyti/showdown#extensions
 markdownConverterProvider.config({
 extensions: ['twitter']
 });
 }])*/
  .config(['$showdownProvider', function ($showdownProvider) {
    $showdownProvider.setOption('omitExtraWLInCodeBlocks', true);
    $showdownProvider.setOption('simplifiedAutoLink', true);
    $showdownProvider.setOption('literalMidWordUnderscores', true);
    $showdownProvider.setOption('strikethrough', true);
    $showdownProvider.setOption('tables', true);
    $showdownProvider.setOption('tablesHeaderId', true);
    $showdownProvider.setOption('ghCodeBlocks', true);
    $showdownProvider.setOption('tasklists', true);
    $showdownProvider.setOption('parseImgDimensions', true);
    $showdownProvider.setOption('parseImgDimensions', true);
    $showdownProvider.setOption('headerLevelStart', 3);
    $showdownProvider.setOption('smoothLivePreview', true);
  }]);
