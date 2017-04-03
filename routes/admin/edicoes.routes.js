// var Model = require.main.require('./models/edicao.model');
var base_route = 'edicoes';

var path = require('path');
var async = require('async');
var uploadFile = require.main.require('./lib/upload-file');
var random = require.main.require('./lib/random');

var mysql = require('../../domain/mysql-helper/mysql');

exports.index = function(req, res, next) {

    mysql.select('editions')
        .orderBy('number')
        .exec(function (all) {
            return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
        });
};

exports.create = function(req, res, next) {

    //var one = new Model;
    var one = {};

    return res.render('admin/'+base_route+'/form', {mode: "create", one: one, base_route: base_route});
};

exports.store = function(req, res, next) {

    // var one = new Model(req.body);
    var one = req.body;

    var current_file = req.files['capa'];

    if (current_file.size <= 0) {
        req.flash('danger', 'Por favor, selecione a imagem da capa.');
        return res.redirect('back');
    }

    var upload_folder = path.join('uploads');
    var filename = Date.now() + '_' + random(20);

    uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
        if (err) { return next(err); }
        one.img_path = relative_path;

        mysql.insert('editions', req.body)
            .exec(function (rows) {
                id = rows.insertId;
                // callback(null, socket, data);
                req.flash('success', 'O registro foi criado com sucesso!');
                return res.redirect('/admin/'+base_route);
            });
    });

};

exports.edit = function(req, res, next) {

    var id = req.params.id;

    mysql.select('editions')
        .where({ id: { o:'=', v: id } })
        .exec(function (rows) {
            return res.render('admin/'+base_route+'/form', {mode: "edit", one: rows[0], base_route: base_route});
        });
};


exports.update = function(req, res, next) {

    async.waterfall([
        function(cb) {
            var current_file = req.files['capa'];

            if (current_file.size <= 0) {
                return cb(null);
            }

            var upload_folder = path.join('uploads');
            var filename = Date.now() + '_' + random(20);

            uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
                if (err) { return next(err); }
                req.body.img_path = relative_path;
                cb(null);
            });
        }
    ], function(err) {
        if (err) { return next(err); }

        mysql.update('editions', req.body)
            .where({ id: { o: '=', v: req.params.id } })
            .exec(function (row) {
                req.flash('success', 'O registro foi alterado com sucesso!');
                return res.redirect('/admin/'+base_route);
            });
    })

};


exports.delete = function(req, res, next) {

    var id = req.params.id;

    mysql.delete('editions')
        .where({ id: { o: '=', v: id } })
        .exec(function () {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        });
};
