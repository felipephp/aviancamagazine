var WeLove = require('../models/welove.model');

var async = require('async');
var path = require('path');
var random = require('../lib/random');
var uploadFile = require('../lib/upload-file');
var mysql = require('../domain/mysql-helper/mysql');

exports.index = function(req, res, next) {

    mysql.select('welove')
        .orderBy('rand()')
        .limit(25)
        .where({ status: { o: '=', v: 1 } })
        .exec(function (rows) {
            return res.render('welove', {welove: rows});
        });
};

exports.send = function(req, res, next) {

    var welove = new WeLove(req.body);

    if (!req.body.email || !req.body.arrive || !req.body.departure) {
        req.flash('sa_danger', 'Por favor, preencha todos os campos');
        return res.redirect('back');
    }

    async.waterfall([
        function(cb) {
            var current_file = req.files['image'];

            if ( !req.files['image'] ) {
                req.flash('sa_danger', 'Por favor, selecione a foto antes de enviar.')
                return res.redirect('back');
            }

            if (current_file.size <= 0) {
                req.flash('sa_danger', 'Por favor, selecione a foto antes de enviar.')
                return res.redirect('back');
            }

            var upload_folder = path.join('uploads');
            var filename = Date.now() + '_' + random(20);

            uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
                if (err) { return next(err); }
                req.body.image = relative_path;
                cb(null);
            });
        }
    ], function(err) {
        if (err) { return next(err); }

        mysql.insert('welove', req.body)
            .exec(function (row) {
                req.flash('sa_success', 'Obrigado por enviar a sua foto pra gente! Entraremos em contato se for aprovada.');
                return res.redirect('back');
            });

    })



};
