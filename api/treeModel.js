/**
 * Created by bsun on 7/30/2015.
 */
var baseDir = './workspace/';
var uuid = require('node-uuid');
module.exports = glob;
/* [{
 "id": "ajson1",
 "parent": "#",
 "text": "Simple root node",
 "type": "FOLDER"
 }, {
 "id": "ajson2",
 "parent": "#",
 "text": "Root node 2",
 "type": "FOLDER",
 "expanded": true
 }, {
 "id": "ajson3",
 "parent": "ajson2",
 "text": "Child 1",
 "type": "FOLDER"
 }, {
 "id": "ajson4",
 "parent": "ajson2",
 "text": "Child 2",
 "type": "FOLDER"
 }, {
 "id": "ajson5",
 "parent": "ajson4",
 "text": "Child 21",
 "type": "FILE",
 "icon": "glyphicon glyphicon-list-alt"
 }, {
 "id": "ajson6",
 "parent": "ajson4",
 "text": "Child 22",
 "type": "FILE",
 "icon": "glyphicon glyphicon-list-alt"
 }];
 */
function glob(dir, fileList, dirIdMap) {
  var fs = fs || require('fs'), files = fs.readdirSync(dir);
  files.forEach(function (file) {
      if (fs.statSync(dir + file).isDirectory()) {
        dirIdMap[dir + file + '/'] = uuid.v4();
        fileList.push({
          "id": dirIdMap[dir + file + '/'],
          "parent": dir === baseDir ? '#' : dirIdMap[dir],
          "text": file,
          "type": "FOLDER"
        });
        fileList = glob(dir + file + '/', fileList, dirIdMap);
      }
      else {
        fileList.push({
          "id": uuid.v4(),
          "parent": dir === baseDir ? '#' : dirIdMap[dir],
          "text": file,
          "type": "FILE",
          "icon": "glyphicon glyphicon-list-alt"
        });
      }
    }
  );
  return fileList;
};

