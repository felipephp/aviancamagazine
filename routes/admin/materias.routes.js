var path = require('path');
var async = require('async');
var moment = require('moment');
var mysql = require('../../domain/mysql');

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
            autores: function (cb) {
                mysql
                    .select('authors')
                    .orderBy('name')
                    .exec(function (authors) {
                        console.log('at::', authors);
                        return cb(null, authors);
                    })
            },
            subcategorias: function (cb) {
                mysql.select('categories', 'id AS sub_id, name AS sub_name')
                    .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: 'name AS cat_name' })
                    .where('A.categories_id IS NOT NULL')
                    .orderBy('B.name')
                    .exec(function (subcategorias) {
                        return cb(null, subcategorias);
                    });
            },
            edicoes: function (cb) {
                mysql.select('editions')
                    .orderBy('number DESC')
                    .exec(function (edicoes) {
                        return cb(null, edicoes);
                    })
            },
            tags: function (cb) {
                mysql.select('tags')
                    .orderBy('name')
                    .exec(function (tags) {
                        return cb(null, tags);
                    })
            },
            localizacoes: function (cb) {
                mysql.select('locations')
                    .orderBy('name')
                    .exec(function (locais) {
                        return cb(null, locais);
                    })
            }
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
        autores: function (cb) {
            mysql
                .select('authors')
                .orderBy('name')
                .exec(function (authors) {
                    console.log('at::', authors);
                    return cb(null, authors);
                })
        },
        subcategorias: function (cb) {
            mysql.select('categories', ['id AS sub_id', 'name AS sub_name'])
                .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS cat_name'] })
                .where('A.categories_id IS NOT NULL')
                .orderBy('B.name')
                .exec(function (subcategorias) {
                    return cb(null, subcategorias);
                });
        },
        edicoes: function (cb) {
            mysql.select('editions')
                .orderBy('number DESC')
                .exec(function (edicoes) {
                    return cb(null, edicoes);
                })
        },
        tags: function (cb) {
            mysql.select('tags')
                .orderBy('name')
                .exec(function (tags) {
                    return cb(null, tags);
                })
        },
        localizacoes: function (cb) {
            mysql.select('locations')
                .orderBy('name')
                .exec(function (locais) {
                    return cb(null, locais);
                })
        }
    }, function(err, results) {
        if (err) { return next(err); }

        mysql.select('articles') //a
            .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['id AS sub_id'] }) //b
            .join({ table: 'editions', on: 'id', key: 'A.editions_id', columns: ['id AS edi_id'] }) //c
            .join({ table: 'authors', on: 'id', key: 'A.authors_id', columns: ['id AS aut_id'] }) //d
            .join({ type: 'LEFT', table: 'locations_has_articles', on: 'articles_id', key: 'A.id', columns: ['locations_id'] }) //e
            .join({ type: 'LEFT', table: 'articles_has_tags', on: 'articles_id', key: 'A.id', columns: ["CONCAT(F.tags_id, ',') AS tags"] }) //f
            .where('A.id = '+id)
            .exec(function (row) {
                row = row[0];
                row.categoria = { id: row.sud_id };
                row.edicao = { id: row.edi_id };
                row.autor = { id: row.aut_id };
                row.localizacao = { id: row.locations_id };

                console.log('found::', row);
                return res.render('admin/'+base_route+'/form', {mode: "edit", one: row, results: results});
            });
    })
};


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
