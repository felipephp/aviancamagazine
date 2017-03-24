var path = require('path');
var fs = require('fs');

var root_path = path.dirname(require.main.filename);

module.exports = function(file, folder, filename, cb) {

    var extension = file.name.split('.').pop();

    var absolute_new_path = path.join(root_path, 'public', folder);

    if (!fs.existsSync(absolute_new_path)){
        fs.mkdirSync(absolute_new_path);
    }

    var new_file_name = filename+'.'+extension;


    // fs.rename(file.path, path.join(absolute_new_path, new_file_name), function (err) {
    //     if (err) throw cb(err);
    //
    //     var relative_path = path.join('/',folder, new_file_name);
    //     cb(null, relative_path)
    //
    // });

    var relative_path = path.join('/', folder, new_file_name);

    // var base64result = file.image.split(',')[1];
    // var base64Data = file.image.replace(/^data:image\/png;base64,/, "");
    var base64Data = file.image.replace(/^data:image\/[^;]*;base64,/, "");

    fs.writeFile(path.join(absolute_new_path, new_file_name), base64Data, 'base64', function(err) {
        if (err) throw cb(err);
        cb(null, relative_path)
    });

};
