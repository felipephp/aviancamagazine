var fs = require('fs');
var express = require('express');
var path = require('path');
var Log = require('log');

var config = require('./config');

var app = express();

var pm2_process_name = require('./pm2')[0].name;

var log_file = 'webhook.log';

var folder = path.join(__dirname, '/logs');
var log_path = path.join(folder, log_file);
if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
}

var fd = fs.openSync(log_path, 'w');
fs.closeSync(fs.openSync(log_path, 'w'));

var log = new Log('info', fs.createWriteStream(log_path, {flags: 'a+'}));

app.post('/', function(req, res, next) {

    var sys = require('sys');
    var exec = require('child_process').exec;
    var child;
    child = exec("git pull && pm2 restart " + pm2_process_name, function (error, stdout, stderr) {
        if (error !== null) {
            log.error('Webhook log: ' + error);
            console.log('exec error: ' + error);
            return res.send({err: error});
        }

        log.info('Webhook log: ' + stdout);
        console.log("stdout: " + stdout);
        return res.send({success: stdout});
    });

});

app.listen(config.app.webhook_port);
