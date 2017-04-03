// var Model = require.main.require('./models/autor.model');
var base_route = 'autores';

var path = require('path');
var async = require('async');
var uploadFile = require.main.require('./lib/upload-file');
var random = require.main.require('./lib/random');
var uploadSlimFile = require.main.require('./lib/upload-slim-file');
var mysql = require('../../domain/mysql-helper/mysql');

exports.index = function(req, res, next) {
    mysql.select('authors')
        .orderBy('name')
        .exec(function (all) {
            return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
        })
};

exports.create = function(req, res, next) {
    return res.render('admin/'+base_route+'/form', {mode: "create", one: {}, base_route: base_route});
};

exports.store = function(req, res, next) {

    var fields = ['avatar'];
    async.eachSeries(fields,
        function(slim_file_name, cb) {

        if (!req.body[slim_file_name]) {
            return cb(null);
        }

        var stringified = "";

        if (typeof req.body[slim_file_name] == "object") {
            stringified = req.body[slim_file_name][0]
        } else {
            stringified = req.body[slim_file_name]
        }

        var current_file = JSON.parse(stringified).output;

        if (!current_file) {
            return cb(null);
        }

        var upload_folder = path.join('uploads');
        var filename = Date.now() + '_' + random(20);

        uploadSlimFile(current_file, upload_folder, filename, function(err, relative_path) {
            //one[slim_file_name+'_path'] = relative_path;
            req.body.photo = relative_path;

            var json = JSON.parse(stringified);
            var original_file = req.files[json.input.field];

            console.log("original_file", original_file);

            if (original_file.size <= 0) {
                return cb(null);
            }

            filename += "_original";
            uploadFile(original_file, upload_folder, filename, function(err, relative_path) {
                return cb(null);
            });

        });

    },

        function(err) {
            delete req.body.avatar;
            mysql.insert('authors', req.body)
                .exec(function (rows) {
                    id = rows.insertId;
                    req.flash('success', 'O registro foi criado com sucesso!');
                    return res.redirect('/admin/'+base_route);
                });

    });
};

exports.edit = function(req, res, next) {

    mysql.select('authors')
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (row) {
            return res.render('admin/'+base_route+'/form', {mode: "edit", one: row[0], base_route: base_route});
        })

};


exports.update = function(req, res, next) {

    var id = req.params.id;

    var fields = ['avatar'];

    async.eachSeries(fields, function(slim_file_name, cb) {

        if (!req.body[slim_file_name]) {
            return cb(null);
        }

        var stringified = "";

        if (typeof req.body[slim_file_name] == "object") {
            stringified = req.body[slim_file_name][0]
        } else {
            stringified = req.body[slim_file_name]
        }

        var current_file = JSON.parse(stringified).output;

        if (!current_file) {
            return cb(null);
        }

        var upload_folder = path.join('uploads');
        var filename = Date.now() + '_' + random(20);

        uploadSlimFile(current_file, upload_folder, filename, function(err, relative_path) {
            // req.body[slim_file_name+'_path'] = relative_path;
            req.body.photo = relative_path;

            var json = JSON.parse(stringified);
            var original_file = req.files[json.input.field];

            if (original_file.size <= 0) {
                return cb(null);
            }

            filename += "_original";
            uploadFile(original_file, upload_folder, filename, function(err, relative_path) {
                return cb(null);
            });

        });

    }, function(err) {
        if (err) { return next(err); }
        delete req.body.avatar;
        mysql.update('authors', req.body)
            .where({ id: { o: '=', v: req.params.id } })
            .exec(function (rows) {
                id = rows.insertId;
                req.flash('success', 'O registro foi atualizado com sucesso!');
                return res.redirect('/admin/'+base_route);
            });
    });
};


exports.delete = function(req, res, next) {
    mysql.delete('authors')
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (r) {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        });
};
