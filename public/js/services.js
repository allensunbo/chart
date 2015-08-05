'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  .value('version', '0.1')
  .service('ChartDataService', function () {
    /*this.dates = {
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
        'missing': randomDates(),
        'forwarded': randomDates2(),
        'test': [2, 4, 5, 9, 11, 12, 13],
      },
      'Price': {
        'available': randomDates(),
        'missing': randomDates2(),
        'forwarded': [],
        'test': []
      }
    };*/

    var allDates = [];
    var startDate = new Date('2009-05-01');
    for (var i = 0; i < 100; i++) {
      var d = new Date('2009-05-01');
      d.setDate(startDate.getDate() + i);
      allDates.push(d.toISOString().slice(0, 10));
    }
    this.allDates = allDates;

    this.rawDates = {
      'Portfolio': {
        'available': ['2009-05-01', '2009-05-04', '2009-05-05', '2009-07-04', '2009-08-08'],
        'forwarded': 2
      },
      'Benchmark': {
        'available': ['2009-05-01', '2009-05-04', '2009-05-05'],
        'forwarded': 2
      },
      'Risk Model': {
        'available': ['2009-05-01', '2009-05-04', '2009-05-05'],
        'forwarded': 2
      },
      'Classification': {
        'available': [],
        'forwarded': 2
      },
      'Price': {
        'available': [],
        'forwarded': 1
      }
    };

    // this.dates = convertRawDates(this.allDates, rawDates);

  });

function randomDates() {
  var dates = [];
  for (var i = 0; i < 100; i++) {
    // if (i % 2 === 0)dates.push(i);
  }
  return dates;
}

function randomDates2() {
  var dates = [];
  for (var i = 0; i < 100; i++) {
    //if (i % 2 === 1)dates.push(i);
  }
  return dates;
}
