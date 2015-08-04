'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MainCtrl', function ($scope, $http, $timeout, $showdown, ChartDataService) {

    plotDataCoverageChart($scope, ChartDataService);

    // editor part
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

function plotDataCoverageChart($scope, ChartDataService) {
  // data coverage chart
  var allDates = ChartDataService.allDates;
  var dates = ChartDataService.dates;

  $scope.chartConfig = {
    id: 'my-chart', // chart id
    title: {
      text: 'Data Coverage Chart'
    },
    xAxis: {
      categories: ['Portfolio', 'Benchmark', 'Risk Model', 'Classification', 'Price'],
    },
    // series: [],
    // seriesTypes: ['available', 'missing', 'forwarded', 'test'],
    allDates: allDates,
    dates: dates
  };
}

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
