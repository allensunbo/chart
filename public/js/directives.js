'use strict';

angular.module('myApp.directives', [])

  .directive('appVersion', function (version) {
    return function (scope, elm, attrs) {
      elm.text(version);
    };
  })

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
          extendConfig(scope, $timeout);

          var dates = scope.config.dates;
          // TODO get from chartConfig directly!
          // var seriesTypes = ['available', 'missing', 'forwarded', 'test'];
          var seriesTypes = [];
          for (var attr in dates) {
            for (var t in dates[attr]) {
              seriesTypes.push(t);
            }
            break;
          }

          var tableInfo = collectTableInfo(seriesTypes, dates);
          // console.log(tableInfo);

          var table = convertRawDataToChartData(scope, dates, tableInfo, seriesTypes);

          // fix color
          scope.config.options.colors = [];
          console.log(scope.config.id)
          for (attr in table) {
            for (var i = 0; i < table[attr].length; i++) {
              if (table[attr][i]['seriesType'] === 'available') {
                scope.config.options.colors.push('#2f7ed8');
              } else if (table[attr][i]['seriesType'] === 'missing') {
                scope.config.options.colors.push('#910000');
              } else if (table[attr][i]['seriesType'] === 'forwarded') {
                scope.config.options.colors.push('#1aadce');
              } else if (table[attr][i]['seriesType'] === 'test') {
                scope.config.options.colors.push('#1aadce');
              }
            }
            break;
          }

        }, 0);
      }
    }
  });

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
  var total = 0;
  for (var t in tableInfo) {
    total += tableInfo[t];
  }


  var attr = Object.keys(dates)[0];
  for (var i = 0; i < table[attr].length; i++) {
    series.push({name: table[attr][i]['seriesType'] + i});
  }

  for (attr in table) {
    for (var i = 0; i < table[attr].length; i++) {
      series[i]['data'] = series[i]['data'] || [];
      // console.log(JSON.stringify(table[attr][i]))
      // series[i]['data'].push({color: 'red'});
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
        text: 'Total fruit consumption'
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
    legend: {
      align: 'right',
      x: -30,
      verticalAlign: 'top',
      y: 25,
      floating: true,
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false,
      enabled: false
    },

    loading: false
  };
}



