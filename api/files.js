/**
 * Created by bsun on 7/30/2015.
 */
module.exports = {
  folders: [
    {
      name: 'Folder 1', files: [{name: 'File 1.jpg'}, {name: 'File 2.png'}], folders: [
      {name: 'Subfolder 1', files: [{name: 'Subfile 1'}]},
      {name: 'Subfolder 2', folders: [{name: 'Subfolder 21', folders: [{name: 'Subfolder 211'}]}]},
      {name: 'Subfolder 3'}
    ]
    },
    {name: 'Folder 2'}
  ]
};
