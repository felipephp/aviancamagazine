var Model = require.main.require('./models/edicao.model');
var base_route = 'edicoes';

var path = require('path');
var async = require('async');
var uploadFile = require.main.require('./lib/upload-file');
var random = require.main.require('./lib/random');

exports.index = function(req, res, next) {

    Model.find({}, function(err, all) {
        if (err) { return next(err); }
        return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
    })

};

exports.create = function(req, res, next) {

    var one = new Model;

    return res.render('admin/'+base_route+'/form', {mode: "create", one: one, base_route: base_route});
}

exports.store = function(req, res, next) {

    var one = new Model(req.body);

    var current_file = req.files['capa'];

    if (current_file.size <= 0) {
        req.flash('danger', 'Por favor, selecione a imagem da capa.');
        return res.redirect('back');
    }

    var upload_folder = path.join('uploads');
    var filename = Date.now() + '_' + random(20);

    uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
        if (err) { return next(err); }
        one.capa_path = relative_path;

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
                req.body.capa_path = relative_path;
                cb(null);
            });
        }
    ], function(err) {
        if (err) { return next(err); }

        Model.findOneAndUpdate({_id: id}, {$set: req.body}, function(err, one) {
            if (err) { return next(err); }
            req.flash('success', 'O registro foi atualizado com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

    })

}


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
