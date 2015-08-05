'use strict';

var maxPoints = 100;

angular.module('myApp.services', [])
  .value('version', '0.1')
  .service('ChartDataService', function () {

    this.allDates = allDates();

    this.rawDates = rawDates(this.allDates);

    this.randomDates = randomDates;
  });

function getCleanDateString(date) {
  return date.toISOString().slice(0, 10);
}

function allDates() {
  var allDates = [];
  var startDate = new Date('2009-05-01');
  for (var i = 0; i < maxPoints; i++) {
    var d = new Date('2009-05-01');
    d.setDate(startDate.getDate() + i);
    allDates.push(getCleanDateString(d));
  }
  return allDates;
}

function rawDates(allDates) {
  return {
    'Portfolio': {
      'available': randomDates(allDates),
      'forwarded': 2
    },
    'Benchmark': {
      'available': randomDates(allDates),
      'forwarded': 2
    },
    'Risk Model': {
      'available': randomDates(allDates),
      'forwarded': 2
    },
    'Classification': {
      'available': randomDates(allDates),
      'forwarded': 2
    },
    'Price': {
      'available': randomDates(allDates),
      'forwarded': 1
    }
  }
}
function randomDates(allDates) {
  var dates = [], i = 0, n = 0, s = 0;
  while (i < maxPoints) {
    n = ~~(Math.random() * 10);
    s = ~~(Math.random() * n);
    for (var k = i; k < i + s; k++) {
      dates.push(allDates[k]);
    }
    i = i + n;
    if (i + n >= maxPoints) {
      return dates;
    }
  }
}
