var fs = require('fs');
var path = require('path');
var Log = require('log');

module.exports = function log(options) {

    options = options || {};

    var log_file = options.log_file || 'app.log';
    var folder = options.log_folder || path.join(__dirname, '../logs');

    var log_path = path.join(folder, log_file);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    var fd = fs.openSync(log_path, 'a+');
    fs.closeSync(fs.openSync(log_path, 'a+'));

    return function(req, res, next) {
        req.log = new Log('debug', fs.createWriteStream(log_path, {flags: 'a+'}));
        next();
    };

};

