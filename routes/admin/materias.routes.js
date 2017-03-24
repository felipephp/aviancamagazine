var path = require('path');
var async = require('async');
var moment = require('moment');

var uploadFile = require('../../lib/upload-file');
var random = require('../../lib/random');

var base_route = "materias";

var Model = require.main.require('./models/materia.model');

var uploadSlimFile = require.main.require('./lib/upload-slim-file');

var Autor = require.main.require('./models/autor.model');
var Categoria = require.main.require('./models/categoria.model');
var Subcategoria = require.main.require('./models/subcategoria.model');
var Edicao = require.main.require('./models/edicao.model');
var Tag = require.main.require('./models/tag.model');
var Localizacao = require.main.require('./models/localizacao.model');

exports.index = function(req, res, next) {

    Model.find({})
        .populate(['edicao', 'autor', 'categoria', 'subcategoria'])
        .exec(function(err, all) {
            if (err) { return next(err); }
            return res.render('admin/'+base_route+'/index', {all: all});
        })

};

exports.create = function(req, res, next) {

    var one = new Model;


        async.series({
            autores: function(cb) {
                Autor.find({})
                    .sort('nome')
                    .exec(function(err, autores) {
                        return cb(null, autores);
                    })
            },
            subcategorias: function(cb) {
                Subcategoria.find({})
                    .populate('categoria')
                    .sort('nome')
                    .exec(function(err, subcategorias) {
                        return cb(null, subcategorias);
                    })
            },
            edicoes: function(cb) {
                Edicao.find({})
                    .sort('-numero')
                    .exec(function(err, edicoes) {
                        return cb(null, edicoes);
                    })
            },
            tags: function(cb) {
                Tag.find({})
                    .sort('nome')
                    .exec(function(err, tags) {
                        return cb(null, tags);
                    })
            },
            localizacoes: function(cb) {
                Localizacao.find({})
                    .sort('nome')
                    .exec(function(err, localizacoes) {
                        return cb(null, localizacoes);
                    })
            },
        }, function(err, results) {
            if (err) { return next(err); }

            // return res.send(results);

            one.edicao = results.edicoes[0]._id;

            return res.render('admin/'+base_route+'/form', {mode: "create", one: one, results: results});

        })


}

exports.store = function(req, res, next) {

    if (req.body.edicao == "") {
        delete req.body.edicao;
    }

    if (req.body.autor == "") {
        delete req.body.autor;
    }

    if (req.body.localizacao == "") {
        delete req.body.localizacao;
    }

    if (req.body.post_at == 'now') {
        req.body.available_at = moment();
    } else {
        req.body.available_at = moment(req.body.available_at, 'DD/MM/YYYY HH:mm');
    }

    var one = new Model(req.body);

    var fields = ['imagem_principal', 'imagem_chamada'];

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
        if (err) { return callback(err); }

        Subcategoria.findOne({_id: req.body.subcategoria})
            .exec(function(err, subcategoria) {
                if (err) { return cb(err); }
                one.categoria = subcategoria.categoria;

                one.save(function(err, saved) {
                    if (err) { return next(err); }
                    req.flash('success', 'O registro foi inserido com sucesso!');
                    return res.redirect('/admin/'+base_route);
                });

            });

    });

}

exports.edit = function(req, res, next) {

    var id = req.params.id;

    async.series({
        autores: function(cb) {
            Autor.find({})
                .sort('nome')
                .exec(function(err, autores) {
                    return cb(null, autores);
                })
        },
        subcategorias: function(cb) {
            Subcategoria.find({})
                .populate('categoria')
                .sort('nome')
                .exec(function(err, subcategorias) {
                    return cb(null, subcategorias);
                })
        },
        edicoes: function(cb) {
            Edicao.find({})
                .sort('nome')
                .exec(function(err, edicoes) {
                    return cb(null, edicoes);
                })
        },
        tags: function(cb) {
            Tag.find({})
                .sort('nome')
                .exec(function(err, tags) {
                    return cb(null, tags);
                })
        },
        localizacoes: function(cb) {
            Localizacao.find({})
                .sort('nome')
                .exec(function(err, localizacoes) {
                    return cb(null, localizacoes);
                })
        },
    }, function(err, results) {
        if (err) { return next(err); }

        Model.findOne({_id: id}, function(err, one) {
            if (err) { return next(err); }
            return res.render('admin/'+base_route+'/form', {mode: "edit", one: one, results: results});
        });

    })



}


exports.update = function(req, res, next) {

    var id = req.params.id;

    if (req.body.edicao == "") {
        delete req.body.edicao;
    }

    if (req.body.autor == "") {
        delete req.body.autor;
    }

    if (req.body.localizacao == "") {
        delete req.body.localizacao;
    }

    req.body.available_at = moment(req.body.available_at, 'DD/MM/YYYY HH:mm');

    var fields = ['imagem_principal', 'imagem_chamada'];

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
        if (err) { return callback(err); }

        Subcategoria.findOne({_id: req.body.subcategoria})
            .exec(function(err, subcategoria) {
                if (err) { return cb(err); }
                req.body.categoria = subcategoria.categoria;

                Model.findOneAndUpdate({_id: id}, {$set: req.body}, function(err, one) {
                    if (err) { return next(err); }
                    req.flash('success', 'O registro foi atualizado com sucesso!');
                    return res.redirect('/admin/'+base_route);
                });

            });

    });

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