'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MainCtrl', function ($scope, $http, $timeout, $showdown) {

    var allDates = [];
    var startDate = new Date('2009-05-01');
    var endDate = new Date('2009-06-30');
    for (var i = 0; i < 100; i++) {
      var d = new Date('2009-05-01');
      d.setDate(startDate.getDate() + i);
      allDates.push(d.toISOString().slice(0, 10));
    }

    $scope.chartConfig = {
      id: 'my-chart', // chart id
      title: {
        text: 'Data Coverage Chart'
      },
      xAxis: {
        categories: ['Portfolio', 'Benchmark', 'Risk Model', 'Classification', 'Price']
      },
      series: [{
        name: 'available',
        data: [[3, 4], [6, 10], [2, 3], [3, 4], [4, 5]]
      }, {
        name: 'missing',
        data: [[2, 3], [4, 6], [2, 3], [3, 4], [4, 5]]
      }, {
        name: 'forwarded',
        data: [[1, 2], [2, 4], [2, 3], [3, 4], [4, 5]]
      }, {
        name: 'forwarded-2',
        data: [[0.5, 1], [2, 4], [2, 3], [3, 4], [4, 5]]
      }, {
        name: 'test',
        data: [[0, 0.5], [0, 2], [2, 3], [3, 4], [4, 5]]
      }],
      allDates: allDates
    };

    var seriesTypes = ['available', 'missing', 'forwarded', 'test'];

    var dates = {
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

    var tableInfo = collectTableInfo(seriesTypes, dates);
    console.log(tableInfo);

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

    // console.log(merge([0, 1, 2, 5, 8, 9, 10]));


    function convertRawDataToChartData(scope, dates, tableInfo, seriesType) {
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
      console.log(JSON.stringify(scope.chartConfig.series));
      console.log(JSON.stringify(table));
      var series = [];
      for (var i = 0; i < seriesTypes.length; i++) {
        var seriesType = seriesTypes[i];


      }
      console.log(series)
      var numberOfAttributes = Object.keys(dates).length;
      var total = 0;
      for (var t in tableInfo) {
        total += tableInfo[t];
      }


      var attr = Object.keys(dates)[0];
      for (var i = 0; i < table[attr].length; i++) {
        series.push({name: table[attr][i]['seriesType']});
      }

      for (attr in table) {
        for (var i = 0; i < table[attr].length; i++) {
          series[i]['data'] = series[i]['data'] || [];
          // console.log(JSON.stringify(table[attr][i]))
          series[i]['data'].push(table[attr][i]['data']);
        }
      }
      scope.chartConfig.series = series;

      console.log('series=');
      console.log(JSON.stringify(series));

    }

    convertRawDataToChartData($scope, dates, tableInfo, seriesTypes);


    /*$scope.chartConfig = {
     options: {
     chart: {
     type: 'column',
     inverted: true
     },
     plotOptions: {
     column: {
     stacking: 'normal',
     dataLabels: {
     enabled: true,
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
     }
     },
     title: {
     text: 'Data Coverage Chart'
     },
     xAxis: {
     categories: ['Portfolio', 'Benchmark', 'Risk Model', 'Classification', 'Price']
     },
     yAxis: {
     min: 0,
     title: {
     text: 'Total fruit consumption'
     },
     stackLabels: {
     enabled: true,
     style: {
     fontWeight: 'bold',
     color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
     }
     },
     labels: {
     formatter: function () {
     return allDates[Math.floor(this.value)];
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
     tooltip: {
     formatter: function () {
     return '<b>' + this.x + '</b><br/>' +
     this.series.name + ': ' + this.y + '<br/>' +
     'Total: ' + this.point.stackTotal;
     }
     },

     series: [{
     name: 'John',
     data: [5, 3, 4, 7, 2]
     }, {
     name: 'Jane',
     data: [2, null, 3, 2, 1]
     }, {
     name: 'Joe',
     data: [3, 4, 4, 2, 5]
     }],

     loading: false
     }*/


    $scope.tabs = $scope.tabs || [];
    $scope.sourceTextChange = function () {
      for (var i = 0; i < $scope.tabs.length; i++) {
        var tab = $scope.tabs[i];
        if (tab.active) {
          var html = $showdown.makeHtml(tab.text);
          console.log(tab.text);
          tab.html = html;
          break;
        }
      }
    };

    /*$http.get('http://localhost:3000/api/files')
     .success(function (data) {
     $scope.files = data;
     }).error(function (err) {
     console.log(err);
     });
     */
    $scope.options = {
      onNodeSelect: function (node, breadcrums) {
        $scope.breadcrums = breadcrums;
        console.log(node);
      }
    };

    var loadFromStorage = false;//localStorage.treeModel;
    if (!loadFromStorage) {
      $http.get('http://localhost:3000/api/treeModel')
        .success(function (data) {
          $scope.treeModel = data;
          localStorage.treeModel = JSON.stringify($scope.treeModel);
        }).error(function (err) {
          console.log(err);
        });
    } else {
      console.log('read from local storage');
      $scope.treeModel = JSON.parse(localStorage.treeModel);
    }

    $scope.readyCB = function () {
      console.log('ready event call back');
      openNode($scope);
      bindDoubleClick($scope, $http);
    };

    $scope.changedCB = function (e, data) {
      console.log('changed event call back');
    };
    $scope.openNodeCB = function (e, data) {
      console.log('open-node event call back');
    };
    $scope.moveNodeCB = function (e, data) {
      console.log(e);
      console.log(data);
      for (var i = 0; i < $scope.treeModel.length; i++) {
        if ($scope.treeModel[i].id === data.node.id) {
          console.log(data.node.id);
          $scope.treeModel[i].parent = data.parent;
          break;
        }
      }

    };

    $scope.createNodeCB = function (e, data) {
      console.log('new node: ' + data.node.id);
      console.log(data);
      //$timeout(function () {
      $scope.treeModel.push({
        "id": data.node.id,
        "parent": data.node.parent,
        "text": data.text,
        "type": "FILE",
        "icon": "glyphicon glyphicon-list-alt"
      });
      //});
    };

    $scope.renameNodeCB = function (e, data) {
      console.log('rename:');
      var selectedNode = findNodeById($scope, data.node.id);
      console.log('old node: ' + data.node.id);
      $timeout(function () {
        selectedNode.model.text = data.text;
        $scope.save();
        console.log($scope.treeModel);
        if (selectedNode.model.type === 'FILE') {
          for (var i = 0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].id === data.node.id) {
              // $scope.tabs.splice(i, 1);
              $scope.tabs[i].path = $scope.tabs[i].path.split('/').slice(0, -1).join('/') + '/' + data.text;
              break;
            }
          }
        }
      });
    };

    $scope.deleteNodeCB = function (e, data) {
      console.log('delete:');
      var selectedNode = findNodeById($scope, data.node.id);
      $scope.treeModel.splice(selectedNode.index, 1);
      // TODO check any tabs belong to this folder
      for (var i = 0; i < $scope.tabs.length; i++) {
        if ($scope.tabs[i].id === data.node.id) {
          $scope.tabs.splice(i, 1);
          break;
        }
      }
      $scope.save();
    };

    $scope.save = function () {
      $timeout(function () {
        //$scope.$apply(function () {
        localStorage.treeModel = JSON.stringify($scope.treeModel);
        //});
      });
      $http.post('http://localhost:3000/api/files', $scope.treeModel)
        .success(function (data) {
          // $scope.files = data;
        }).error(function (err) {
          console.log(err);
        });

    };

    $scope.saveFile = function () {
      var idx = -1;
      for (var i = 0; i < $scope.tabs.length; i++) {
        if ($scope.tabs[i].active) {
          idx = i;
          break;
        }
      }
      console.log($scope.tabs[idx].path);
      var path = $scope.tabs[idx].path, content = $scope.tabs[idx].text;
      $http.post('http://localhost:3000/api/file', {path: path, content: content})
        .success(function (data) {

        })
        .error(function (err) {
          console.log(err);
        });
    }

    $scope.removeTab = function ($index) {
      $scope.tabs.splice($index, 1);
    }
    //
  });

function findNodeById($scope, id) {
  for (var i = 0; i < $scope.treeModel.length; i++) {
    if ($scope.treeModel[i].id === id) {
      return {model: $scope.treeModel[i], index: i};
    }
  }
}

function openNode($scope) {
  for (var i = 0; i < $scope.treeModel.length; i++) {
    if ($scope.treeModel[i].expanded) {
      // TODO DOM operation should go to directive
      $('#jsTree').jstree("open_node", "#" + $scope.treeModel[i].id);
    }
  }
}

function bindDoubleClick($scope, $http) {
  $('#jsTree').bind("dblclick.jstree", function (e, data) {
    $scope.tabs = $scope.tabs || [];
    var node = $(event.target).closest('li')[0];
    var id = node.id;


    for (var k = 0; k < $scope.tabs.length; k++) {
      $scope.tabs[k].active = false;
    }

    for (var k = 0; k < $scope.tabs.length; k++) {
      if ($scope.tabs[k].id === id) {
        console.log('already opened');
        $scope.$apply(function () {
          $scope.tabs[k].active = true;
        });
        return;
      }
    }


    var idIndex = indexId($scope);
    var idx = -1;
    for (var i = 0; i < $scope.treeModel.length; i++) {
      if ($scope.treeModel[i].id === id && $scope.treeModel[i].type === 'FILE') {
        //console.log(node)
        //console.log($scope.treeModel[i])
        var parents = [];
        var parent = idIndex[$scope.treeModel[i].parent];
        //console.log(parent);
        parents.push(parent);
        while (parent && parent.parent !== '#') {
          parent = idIndex[parent.parent];
          //console.log(parent);
          parents.push(parent);
        }
        idx = i;
        break;
      }
    }

    if (idx < 0) return;
    console.log(parents);
    var paths = [$scope.treeModel[idx].text];
    paths.push();
    for (var i = 0; i < parents.length; i++) {
      console.log(parents[i].text);
      paths.push(parents[i].text);
    }
    paths.reverse();
    $scope.$apply(function () {
      for (var k in $scope.tabs) {
        $scope.tabs[k].active = false;
      }
      var text;
      $http.get('http://localhost:3000/api/file?path=' + paths.join('/')).success(function (data) {
        $scope.tabs.push({path: paths.join('/'), id: id, active: true, text: data.content});
      });

    });
  });
}

function indexId($scope) {
  var map = {};
  for (var i = 0; i < $scope.treeModel.length; i++) {
    map[$scope.treeModel[i].id] = $scope.treeModel[i];
  }
  return map;
}
