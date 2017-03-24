var request = require("request");

var my_app;
var key;
var from_email;
var from_name;
var domain;

exports.initialize = function(app, options) {
    if (!options) { options = {} }
    my_app = app;
    key = options.key || "";
    from_email = options.from_email || "";
    from_name = options.from_name || "";
    domain = options.domain || 'gabrielstein.com.br';

    return function(req, res, next) {
        next();
    }
};

exports.sendByView = function(to, subject, template_name, data, callback) {

    my_app.render(template_name, data, function(err, body) {

        if(err) {
            return callback(err);
        }

        var mailgun = require('mailgun-js')({apiKey: key, domain: domain});

        var data = {
            from: from_name+' <'+from_email+'>',
            to: to,
            subject: subject,
            html: body
        };

        mailgun.messages().send(data, function (error, body) {
            console.log("error");
            console.log(error);
            callback(error, body);
        });

    });

};