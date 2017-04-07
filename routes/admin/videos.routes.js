var Model = require.main.require('./models/video.model');
var base_route = 'videos';

var path = require('path');
var async = require('async');
var uploadFile = require.main.require('./lib/upload-file');
var random = require.main.require('./lib/random');
var uploadSlimFile = require.main.require('./lib/upload-slim-file');

exports.index = function(req, res, next) {

    Model.find({}, function(err, all) {
        if (err) { return next(err); }
        return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
    })

};

exports.create = function(req, res, next) {
    var one = new Model;
    return res.render('admin/'+base_route+'/form', {mode: "create", one: one, base_route: base_route});
};

exports.store = function(req, res, next) {

    var one = new Model(req.body);

    var fields = ['miniatura'];

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
            one[slim_file_name+'_path'] = relative_path;

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

    }, function(err) {
        if (err) { return next(err); }

        one.save(function(err, saved) {
            if (err) { return next(err); }
            req.flash('success', 'O registro foi criado com sucesso!');
            return res.redirect('/admin/'+base_route);
        })

    });
}

exports.edit = function(req, res, next) {

    var id = req.params.id;

    Model.findOne({_id: id}, function(err, one) {
        if (err) { return next(err); }
        return res.render('admin/'+base_route+'/form', {mode: "edit", one: one, base_route: base_route});
    });

}


exports.update = function(req, res, next) {

    var id = req.params.id;

    var fields = ['miniatura'];

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
            req.body[slim_file_name+'_path'] = relative_path;

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

    }, function(err) {
        if (err) { return next(err); }

        Model.findOneAndUpdate({_id: id}, {$set: req.body}, function(err, one) {
            if (err) { return next(err); }
            req.flash('success', 'O registro foi atualizado com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

    });
};


exports.delete = function(req, res, next) {

    var id = req.params.id;

    Model.findOne({_id: id}, function(err, one) {
        if (err) { return next(err); }

        one.remove(function(err) {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

    });

}
