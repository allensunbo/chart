'use strict';

angular.module('myApp.directives', [])

  .directive('appVersion', function (version) {
    return function (scope, elm, attrs) {
      elm.text(version);
    };
  })

  .constant('seriesType', 'seriesType')

  .directive('dataCoverage', function ($timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: '<div><highchart id="{{config.id}}" config="config" class="span10"></highchart></div>',
      scope: {
        config: '='
      },
      link: function (scope, elem, attrs) {

        $timeout(function () {
          extendConfig(scope);

          var dates = scope.config.dates;

          // var seriesTypes = ['available', 'missing', 'forwarded', 'test'];
          var seriesTypes = scope.config.seriesTypes;

          var tableInfo = collectTableInfo(seriesTypes, dates);

          var table = convertRawDataToChartData(scope, dates, tableInfo, seriesTypes);

          fixColor(scope, table);

        }, 0);
      }
    }
  });

function fixColor(scope, table) {
  scope.config.options.colors = [];
  for (var attr in table) {
    for (var i = 0; i < table[attr].length; i++) {
      if (table[attr][i]['seriesType'] === 'available') {
        scope.config.options.colors.push('green');
      } else if (table[attr][i]['seriesType'] === 'missing') {
        scope.config.options.colors.push('#CC0A3B');
      } else if (table[attr][i]['seriesType'] === 'forwarded') {
        scope.config.options.colors.push('#CC9119');
      } else if (table[attr][i]['seriesType'] === 'test') {
        scope.config.options.colors.push('#1aadce');
      }
    }
    break;
  }

}

// merge 1D array data into ranges
// eg [0, 1, 2, 5, 8, 9, 10] ==> [[0,3], [5,6], [8,11]
function merge(data) {
  var _start = 0, _end = 0, cur = 1;
  var result = [];
  while (_end < data.length) {
    if (data[cur] === data[cur - 1] + 1) {
      _end = cur;
      cur++;
    } else {
      result.push([data[_start], data[_end] + 1]);
      _end++;
      _start = _end;
      cur = _start + 1;
    }
  }
  return result;
}

function collectTableInfo(seriesTypes, dates) {
  var tableInfo = {};
  seriesTypes.forEach(function (seriesType) {
    var s = 0;
    for (var attr in dates) {
      // console.log(attr);
      var data = dates[attr][seriesType];
      var merged = merge(data);
      // console.log(merged);
      s = s < merged.length ? merged.length : s;
    }
    console.log(s);
    tableInfo[seriesType] = s;
  });
  return tableInfo;
}

function extendConfig(scope) {
  var _config = {};
  angular.extend(_config, defaultConfig(scope), scope.config);
  angular.copy(_config, scope.config);

}

function convertRawDataToChartData(scope, dates, tableInfo, seriesTypes) {
  var table = {};
  for (var attr in dates) {
    //console.log(attr);
    var el = [];
    for (var i = 0; i < seriesTypes.length; i++) {
      //console.log('@' + tableInfo[seriesTypes[i]]);
      var data = dates[attr][seriesTypes[i]];
      var merged = merge(data);
      for (var j = 0; j < merged.length; j++) {
        el.push({seriesType: seriesTypes[i], data: merged[j]});
      }
      for (var j = merged.length; j < tableInfo[seriesTypes[i]]; j++) {
        el.push({seriesType: seriesTypes[i], data: [null, null]});
      }
    }
    table[attr] = el;
  }
  // console.log(JSON.stringify(scope.config.series));
  console.log(JSON.stringify(table));
  var series = [];
  for (var i = 0; i < seriesTypes.length; i++) {
    var seriesType = seriesTypes[i];
  }
  console.log(series)

  var _first = [0];
  for (var t in tableInfo) {
    _first.push(_first[_first.length - 1] + tableInfo[t]);
  }

  console.log(_first);

  var attr = Object.keys(dates)[0];
  for (var i = 0; i < table[attr].length; i++) {
    // data set name
    series.push({name: table[attr][i]['seriesType'] + '#' + i, first: _first.indexOf(i) >= 0});
  }

  for (attr in table) {
    for (var i = 0; i < table[attr].length; i++) {
      series[i]['data'] = series[i]['data'] || [];
      // console.log(JSON.stringify(table[attr][i]))
      // series[i]['data'].push({color: 'red'});
      if (!series[i]['first'])
        series[i]['showInLegend'] = false;
      series[i]['data'].push(table[attr][i]['data']);
    }
  }
  scope.config.series = series;

  console.log('series=');
  console.log(JSON.stringify(series));
  return table;
}

function defaultConfig(scope) {
  return {
    options: {
      // colors: ['#2f7ed8', '#2f7ed8', '#2f7ed8', '#2f7ed8', '#910000', '#910000', '#910000', '#1aadce', '#1aadce', '#1aadce', '#1aadce', '#1aadce'],
      chart: {
        type: 'columnrange',
        inverted: true,
        colorByPoint: true
      },
      plotOptions: {
        columnrange: {
          stacking: 'normal',
          dataLabels: {
            enabled: false,
            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
            style: {
              textShadow: '0 0 3px black'
            }
          },
          showInLegend: true
        },
        series: {
          animation: false,
          events: {
            legendItemClick: function () {
              return false; // <== returning false will cancel the default action
            }
          }
        }
      },
      legend: {
        align: 'center',
        x: -30,
        verticalAlign: 'bottom',
        y: 25,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false,
        enabled: true,
        labelFormatter: function () {
          return this.name.substring(0, this.name.lastIndexOf('#'));
        }
      },
      tooltip: {
        formatter: function () {
          /* return '<b>' + this.x + '</b><br/>' +
           this.series.name + ': ' + this.y + '<br/>' +
           'Total: ' + this.point.stackTotal;*/
          // console.log(this);
          var series = scope.config.series;
          var xCategories = scope.config.xAxis.categories;
          var seriesName = this.series.name;
          var attrName = this.x;
          for (var dataIdx = 0; dataIdx < series.length; dataIdx++) {
            for (var attrIdx = 0; attrIdx < xCategories.length; attrIdx++) {
              var data = series[dataIdx];
              var attr = xCategories[attrIdx];
              if (seriesName === data.name && attrName === attr) {
                var _start = 0, _end = 0;
                var n = series.length - 1;
                for (var k = 0; k < n - dataIdx; k++) {
                  _start += series[n - k].data[attrIdx];
                }
                _end = _start + series[dataIdx].data[attrIdx] - 1; // end date exclusive
                return scope.config.allDates[_start] + ' - ' + scope.config.allDates[_end];
              }
            }
          }
          return '';
        }
      }
    },
    /* title: {
     text: 'Data Coverage Chart'
     },*/

    yAxis: {
      min: 0,
      title: {
        text: ''
      },
      stackLabels: {
        enabled: false,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      },
      labels: {
        formatter: function () {
          return scope.config.allDates[Math.floor(this.value)];
        }
      },
      tickInterval: 1
    },


    loading: false
  };
}



