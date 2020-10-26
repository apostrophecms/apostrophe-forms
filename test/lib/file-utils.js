const fs = require('fs');
const uploadSource = `${__dirname}/upload_tests/`;

module.exports = {
  wipeIt: function (uploadTarget, apos, callback) {
    deleteFolderRecursive(uploadTarget);

    function deleteFolderRecursive(path) {
      var files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
          var curPath = path + "/" + file;
          if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    }

    apos.db.collection('aposAttachments', function (err, collection) {
      if (err) {
        console.error('⚠️', err);
      }
      collection.remove({}, callback);
    });

  },
  insert: function (filename, apos, callback) {
    return apos.attachments.insert(apos.tasks.getReq(), {
      name: filename,
      path: `${uploadSource}${filename}`
    }, function (err, info) {
      if (err) {
        console.error(err);
      }

      callback(info);
    });
  }
};
