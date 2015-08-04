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
        extendConfig(scope, $timeout);
      }
    }
  });

function extendConfig(scope, $timeout) {
  $timeout(function () {
    var _config = {};
    angular.extend(_config, defaultConfig(scope), scope.config);
    angular.copy(_config, scope.config);
  }, 0);
}

function defaultConfig(scope) {
  return {
    options: {
      colors: ['#2f7ed8', '#910000', '#8bbc21', '#1aadce'],
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
