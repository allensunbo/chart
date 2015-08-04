/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
// routes = require('./routes'),
// api = require('./routes/api'),
  http = require('http'),
  path = require('path'),
  fs = require('fs'), cors = require('cors');

var app = module.exports = express();

var baseDir = './workspace/';


app.use(cors());
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(morgan('dev'));
app.use(methodOverride());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit: '50mb'}));
// app.use(cookieParser());

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  // app.use(express.errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}

// serve index and view partials
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/api/files', function (req, res, next) {
  var files = require('./api/files');
  res.json(files);
});

app.get('/api/file', function (req, res, next) {
  console.log(req.query.path);
  fs.readFile(baseDir + '/' + req.query.path, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.json({content: data});
  });
});

app.post('/api/file', function (req, res, next) {
  var path = req.body['path'], content = req.body['content'];
  fs.writeFile(baseDir + '/' + path, content, function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.json({status: 'successful!'});
  });
});

app.post('/api/files', function (req, res, next) {
  var mkdirp = require('mkdirp');
  var baseDir = './workspace';
  var treeModel = req.body;
  var idIndex = indexId(treeModel);
  for (var i = 0; i < treeModel.length; i++) {
    var parents = findParents(treeModel, treeModel[i].id, idIndex);
    var paths = [];
    parents.forEach(function (value) {
      if (value) paths.push(value.text);
    });
    if (treeModel[i].type === 'FILE') {
      console.log('[F]\t' + paths.join('/'));
      var folder = paths.slice(0, -1);
      console.log(folder);
      var _folder = baseDir + '/' + folder.join('/');
      mkdirp(_folder, function (err) {
        if (err) {
          res.status(400).end('cannot create folder\t' + _folder);
        }
      });

      var _file = _folder + '/' + paths.slice(-1);
      fs.writeFile(_file, _file, function (err) {
        if (err) {
          res.status(400).end('cannot create file\t' + _file);
        }
      });

    } else {
      console.log('[D]\t' + paths.join('/'));
      var folder = paths;
      console.log(folder);
      var _folder = baseDir + '/' + folder.join('/');
      mkdirp(_folder, function (err) {
        if (err) {
          res.status(400).end('cannot create folder\t' + _folder);
        }
      });
    }
  }
  res.json('done');
});

app.get('/api/treeModel', function (req, res, next) {
  var glob = require('./api/treeModel');
  var fileList = [];
  var dirIdMap = {};
  glob(baseDir, fileList, dirIdMap);
  console.log(fileList);
  console.log(dirIdMap);
  var treeModel = fileList;
  res.json(treeModel);
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

function indexId(treeModel) {
  var map = {};
  for (var i = 0; i < treeModel.length; i++) {
    map[treeModel[i].id] = treeModel[i];
  }
  return map;
}

function findParents(treeModel, id, idIndex) {
  var parents = [];
  for (var i = 0; i < treeModel.length; i++) {
    if (treeModel[i].id === id) {
      parents.push(treeModel[i]);
      //console.log(node)
      //console.log($scope.treeModel[i])
      var parent = idIndex[treeModel[i].parent];
      //console.log(parent);
      parents.push(parent);
      while (parent && parent.parent !== '#') {
        parent = idIndex[parent.parent];
        //console.log(parent);
        parents.push(parent);
      }
      parents.reverse();
      return parents;
    }
  }
}