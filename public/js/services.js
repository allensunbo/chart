'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  .value('version', '0.1')
  .service('ChartDataService', function () {
    this.dates = {
      'Portfolio': {
        'available': [0, 1, 2, 5, 8, 9, 10],
        'missing': [6, 12, 13],
        'forwarded': [3, 4, 7, 11],
        'test': []
      },
      'Benchmark': {
        'available': [0, 6, 8, 10],
        'missing': [1, 3, 7],
        'forwarded': [2, 4, 5, 9, 11, 12, 13],
        'test': []
      },
      'Risk Model': {
        'available': [0, 1, 3, 4, 5, 7, 8, 10],
        'missing': [],
        'forwarded': [],
        'test': []
      },
      'Classification': {
        'available': [],
        'missing': [],
        'forwarded': [],
        'test': []
      },
      'Price': {
        'available': [],
        'missing': [],
        'forwarded': [],
        'test': []
      }
    };

    var allDates = [];
    var startDate = new Date('2009-05-01');
    var endDate = new Date('2009-06-30');
    for (var i = 0; i < 100; i++) {
      var d = new Date('2009-05-01');
      d.setDate(startDate.getDate() + i);
      allDates.push(d.toISOString().slice(0, 10));
    }
    this.allDates = allDates;
  });
