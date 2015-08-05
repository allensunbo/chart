'use strict';


var datatSetDelimiter = '#%';

angular.module('myApp.directives', [])

  .directive('appVersion', function (version) {
    return function (scope, elm, attrs) {
      elm.text(version);
    };
  })

  .constant('seriesType', 'seriesType')

  .directive('dataCoverage', function ($timeout, ChartDataService) {
    return {
      restrict: 'E',
      replace: true,
      template: '<div style="margin:10px;padding:10px;">' +
      '<highchart id="{{config.id}}" config="config" class="span10"></highchart>' +
      '<button ng-click="update()">update</button>' +
      '</div>',
      scope: {
        config: '='
      },
      link: function (scope, elem, attrs) {

        // try update
        scope.update = function () {
          removeAttrFromChart(scope, 'Classification');
          addAttrToChart(scope, 'Alpha', {
            'available': ChartDataService.randomDates(scope.config.allDates),
            'forwarded': 3
          });
          init(scope, $timeout);
        };
        init(scope, $timeout);
      }
    };

    function removeAttrFromChart(scope, attrName) {
      delete scope.config.rawDates[attrName];
      delete scope.config.dates[attrName];
      scope.config.xAxis.categories.splice(scope.config.xAxis.categories.indexOf(attrName), 1);
    }

    function addAttrToChart(scope, attrName, rawDates) {
      scope.config.rawDates[attrName] = rawDates;
      scope.config.xAxis.categories.push(attrName);
    }

    function init(scope, $timeout) {
      $timeout(function () {

        scope.config.dates = convertRawDates(scope.config.allDates, scope.config.rawDates);

        extendConfig(scope);

        var dates = scope.config.dates;

        // var seriesTypes = ['available', 'missing', 'forwarded', 'test'];
        var seriesTypes = scope.config.seriesTypes;

        var tableInfo = collectTableInfo(seriesTypes, dates);

        var table = convertRawDataToChartSeries(scope, dates, tableInfo, seriesTypes);

        fixColor(scope, table);

      }, 0);
    }

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
        // console.log(s);
        tableInfo[seriesType] = s;
      });
      return tableInfo;
    }

    function extendConfig(scope) {
      angular.copy(angular.merge({}, defaultConfig(scope), scope.config), scope.config);
    }

    function convertRawDataToTable(dates, tableInfo, seriesTypes) {
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
      // console.log(JSON.stringify(table));
      return table;
    }

    function convertRawDataToChartSeries(scope, dates, tableInfo, seriesTypes) {
      var table = convertRawDataToTable(dates, tableInfo, seriesTypes);

      var series = [];
      for (var i = 0; i < seriesTypes.length; i++) {
        var seriesType = seriesTypes[i];
      }
      // console.log(series)

      var _first = [0];
      for (var t in tableInfo) {
        _first.push(_first[_first.length - 1] + tableInfo[t]);
      }

      var attr = Object.keys(dates)[0];
      for (var i = 0; i < table[attr].length; i++) {
        // data set name
        series.push({name: table[attr][i]['seriesType'] + datatSetDelimiter + i, first: _first.indexOf(i) >= 0});
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

      //console.log('series=');
      //console.log(JSON.stringify(series));
      return table;
    }

    function defaultConfig(scope) {
      return {
        options: {
          // colors: ['#2f7ed8', '#2f7ed8', '#2f7ed8', '#2f7ed8', '#910000', '#910000', '#910000', '#1aadce', '#1aadce', '#1aadce', '#1aadce', '#1aadce'],
          chart: {
            type: 'columnrange',
            inverted: true,
            colorByPoint: true,
            backgroundColor: 'transparent',
            plotBorderColor: '#ccc',
            plotBorderWidth: 2,
            shadow: false,
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
            align: 'right',
            x: 0,
            verticalAlign: 'center',
            layout: 'vertical',
            y: 125,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false,
            enabled: true,
            labelFormatter: function () {
              return cleanSeriesName(this.name);
            },
            margin: 20,
          },
          tooltip: {
            formatter: tooltipFormatter(scope),
            positioner: function (labelWidth, labelHeight, point) {
              return {
                x: point.plotX,
                y: point.plotY + 60
              };
            }
          }
        },
        title: {
          //text: 'Data Coverage Chart'
          style: {
            "color": "blue", "fontSize": "18px", 'font-weight': 'bold'
          }
        },
        xAxis: {
          tickLength: 0
        },
        yAxis: {
          min: 0,
          title: {
            text: ''
          },
          gridLineWidth: 0,
          lineWidth: 1,
          tickLength: 5,
          tickWidth: 1,
          tickPosition: 'outside',
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

        seriesTypes: ['available', 'missing', 'forwarded'/*, 'test'*/],

        loading: false
      };
    }

    function tooltipFormatter(scope) {
      return function () {
        var series = scope.config.series;
        var xCategories = scope.config.xAxis.categories;
        var seriesName = this.series.name;
        var attrName = this.x;
        for (var dataIdx = 0; dataIdx < series.length; dataIdx++) {
          for (var attrIdx = 0; attrIdx < xCategories.length; attrIdx++) {
            var data = series[dataIdx];
            var attr = xCategories[attrIdx];
            if (seriesName === data.name && attrName === attr) {
              var _start = series[dataIdx]['data'][attrIdx][0],
                _end = series[dataIdx]['data'][attrIdx][1] - 1; // end date exclusive
              if (_end === _start) {
                return cleanSeriesName(seriesName) + '<br>' + scope.config.allDates[_start];
              } else {
                return cleanSeriesName(seriesName) + '<br>' + scope.config.allDates[_start] + ' to ' + scope.config.allDates[_end];
              }
            }
          }
        }
        return '';
      }
    }

    function cleanSeriesName(seriesName) {
      return seriesName.substring(0, seriesName.lastIndexOf(datatSetDelimiter));
    }


    function convertRawDates(allDates, rawDates) {
      var dates = {};
      for (var attr in rawDates) {
        var o = fillDates(allDates, rawDates[attr]['available'], rawDates[attr]['forwarded']);
        dates[attr] = o;
      }
      // console.log(JSON.stringify(dates))
      return dates;
    }

    // eg '2009-05-01' ==> 0, '2009-05-02' ==> 1 ...
    function indexifyDateStrings(allDates, dateStrings) {
      var map = {};
      // indexify allDates
      allDates.forEach(function (v, k) {
        map[v] = k;
      });

      var dates = [];
      dateStrings.forEach(function (v) {
        dates.push(map[v]);
      })
      return dates;
    }

    // for each attribute, given available dates (in string format) and number of roll forward, figure out forwarded and missing dates
    function fillDates(allDates, availableDates, nForward) {
      var available = indexifyDateStrings(allDates, availableDates), missing = [], forwarded = [];
      allDates.forEach(function (v, k) {
        if (available.indexOf(k) < 0) {
          var isForwarded = false;
          for (var i = 1; i <= nForward && k - i >= 0; i++) {
            if (available.indexOf(k - i) >= 0) {
              forwarded.push(k);
              isForwarded = true;
              break;
            }
          }
          if (!isForwarded) {
            missing.push(k);
          }
        }
      });

      var o = {
        'available': available,
        'missing': missing,
        'forwarded': forwarded
      }
      // console.log(o);
      return o;
    }
  });



