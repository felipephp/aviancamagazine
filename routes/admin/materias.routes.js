var path = require('path');
var async = require('async');
var moment = require('moment');
var mysql = require('../../domain/mysql-helper/mysql');
var generateSlug = require('../../domain/generate-slug');

var uploadFile = require('../../lib/upload-file');
var random = require('../../lib/random');

var base_route = "materias";
var Model = require.main.require('./models/materia.model');
var uploadSlimFile = require.main.require('./lib/upload-slim-file');

exports.index = function(req, res, next) {

    // Model.find({})
    //     .populate(['edicao', 'autor', 'categoria', 'subcategoria'])
    //     .exec(function(err, all) {
    //         if (err) { return next(err); }
    //         return res.render('admin/'+base_route+'/index', {all: all});
    //     })
    mysql.select('articles', ['title','id'])
        .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS subcategoria'] })
        .join({ table: 'categories', on: 'id', key: 'B.categories_id', columns: ['name AS categoria'] })
        .join({ table: 'authors', on: 'id', key: 'A.authors_id', columns: ['name AS author_name'] })
        .join({ table: 'editions', on: 'id', key: 'A.editions_id', columns: ['number AS edition'] })
        .exec(function (rows) {
            return res.render('admin/'+base_route+'/index', {all: rows});
        })

};

exports.create = function(req, res, next) {

    mysql.select('articles', ['id', 'title'])
        .where({
            headline_img_path: { o: '?', v: 'IS NOT NULL' },
            besides: 'OR',
            categories_id: { o: '=', v: '12' }
        })
        .exec(function (rows) {
            //console.log('newWhere::', rows);
            //die();
        });

    var one = new Model;
        async.series({
            autores: function (cb) {
                mysql
                    .select('authors')
                    .orderBy('name')
                    .exec(function (authors) {
                        //console.log('at::', authors);
                        return cb(null, authors);
                    })
            },
            subcategorias: function (cb) {
                mysql.select('categories', ['id AS sub_id', 'name AS sub_name'])
                    .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS cat_name'] })
                    .where({
                        categories_id: { o: '?', v: 'IS NOT NULL', alias: 'A'}
                    })
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


};

exports.store = function(req, res, next) {

    var id = null;

    var tags = ( typeof req.body.tags == 'string') ? [req.body.tags] : req.body.tags;
    delete req.body.tags;

    var location = req.body.locations_id;
    delete req.body.locations_id;

    async.waterfall(
        [
            function(callback) {
                callback(null, null, null);
            },

            //Various
            function (socket, data, callback)  {
                req.body.slug = generateSlug(req.body.title);
                delete req.body.created_at;

                if (req.body.available_at == '')
                {
                    console.log('\n\ndeleted...');
                    //delete req.body.available_at;
                    delete req.body.available_at;
                    callback(null, socket, data);
                }
                else
                {
                    if ( req.body.available_at == 'now' || req.body.available_at == 'choose_date' ) {
                        delete req.body.available_at;
                    }else{
                        req.body.available_at = convert_date(req.body.available_at);
                    }

                    callback(null, socket, data);
                }


            },

            verifyImages,

            function (socket, data, callback)  {
                mysql.insert('articles', req.body)
                    .exec(function (rows) {
                        // console.log('Inserted::', rows);
                        id = rows.insertId;
                        // return false;
                        callback(null, socket, data);
                    });
            },

            function (socket, data, callback) {
                // console.log("\n\nid::", id);
                mysql.syncManyToMany
                (
                    'articles_has_tags',
                    { key: 'articles_id', value: id },
                    { key: 'tags_id', data: tags },
                    function(rows) {
                        callback(null, data);
                    }
                )
            }

        ],
        function(err, result) {
            req.flash('success', 'O registro foi atualizado com sucesso!');
            return res.redirect('/admin/'+base_route);
        }
    );

    function verifyImages(socket, data, callback)
    {
        var fields = ['main_img_path', 'headline_img_path'];
        async.eachSeries(fields, function(slim_file_name, cb) {

            if (!req.body[slim_file_name]) {
                delete req.body[slim_file_name];
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
                delete req.body[slim_file_name];
                return cb(null);
            }

            var upload_folder = path.join('uploads');
            var filename = Date.now() + '_' + random(20);

            uploadSlimFile(current_file, upload_folder, filename, function(err, relative_path) {
                req.body[slim_file_name] = relative_path;

                var json = JSON.parse(stringified);
                var original_file = req.files[json.input.field];

                console.log("original_file", original_file);

                if (original_file.size <= 0) {
                    delete req.body[slim_file_name];
                    return cb(null);
                }

                filename += "_original";
                uploadFile(original_file, upload_folder, filename, function(err, relative_path) {
                    //delete req.body[slim_file_name];
                    // req.body[slim_file_name] = relative_path;
                    return cb(null);
                });

            });

        }, function(err) {
            if (err) { return callback(err); }

            callback(null, null, null);
        });
    }

    //req.body.available_at = moment(req.body.available_at, 'DD/MM/YYYY HH:mm');
    function convert_date(obj) {

        var avail_date = obj.split('/');
        var date 	= avail_date[0];
        var month 	= parseInt(avail_date[1]);
        var year 	= avail_date[2].split(' ')[0];

        var time 	= avail_date[2].split(' ')[1];
        obj = year+'-'+month+'-'+date+' '+time;
        console.log("Obj::", obj);
        return obj;
    }
};

exports.edit = function(req, res, next) {

    var id = req.params.id;

    async.series({
        autores: function (cb) {
            mysql
                .select('authors')
                .orderBy('name')
                .exec(function (authors) {
                    //console.log('at::', authors);
                    return cb(null, authors);
                })
        },
        subcategorias: function (cb) {
            mysql.select('categories', ['id AS sub_id', 'name AS sub_name'])
                .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS cat_name'] })
                .where({
                    categories_id: { alias: 'A', o: '?', v: 'IS NOT NULL' }
                })
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
            .join({ type: 'LEFT', table: 'articles_has_tags', on: 'articles_id', key: 'A.id', columns: ["GROUP_CONCAT(F.tags_id) AS tags"] }) //f
            .where({
                id: { alias: 'A', o: '=', v: id }
            })
            .groupBy('A.id')
            .exec(function (row) {
                row = row[0];
                console.log("\n\nROW::", row);
                row.categoria = { id: row.sub_id };
                row.edicao = { id: row.edi_id };
                row.autor = { id: row.aut_id };
                row.localizacao = { id: row.locations_id };
                // row.tags = ( !row.tags ) ? [] : row.tags.split(',');
                row.tags = ( !row.tags ) ? [] : row.tags.split(",");
                //console.log('TAGS::', row.tags);

                var d = row.available_at;
                var finalDate = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes();
                row.available_at = d.getDate()+'-'+ (d.getMonth()+1) +'-'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes();

                //console.log('found::', row);
                return res.render('admin/'+base_route+'/form', {mode: "edit", one: row, results: results});
            });
    })
};

exports.update = function(req, res, next) {

    var id = req.params.id;

    var tags = ( typeof req.body.tags == 'string') ? [req.body.tags] : req.body.tags;
    delete req.body.tags;

    var location = req.body.locations_id;
    delete req.body.locations_id;

    async.waterfall(
        [
            function(callback) {
                callback(null, null, null);
            },

            function (socket, data, callback)  {
                req.body.available_at = convert_date(req.body.available_at);
                callback(null, socket, data);
            },

            verifyImages,

            function (socket, data, callback)  {
                mysql.update('articles', req.body)
                    .where(
                        { id: { o: '=', v: id } }
                    )
                    .exec(function (rows) {
                        callback(null, socket, data);
                    });
            },

            function (socket, data, callback) {
                console.log("\n\nid::", id);
                mysql.syncManyToMany
                (
                    'articles_has_tags',
                    { key: 'articles_id', value: id },
                    { key: 'tags_id', data: tags },
                    function(rows) {
                        callback(null, data);
                    }
                )
            }

        ],
        function(err, result) {
            req.flash('success', 'O registro foi atualizado com sucesso!');
            return res.redirect('/admin/'+base_route);
        }
    );

    function verifyImages(socket, data, callback)
    {
        var fields = ['main_img_path', 'headline_img_path'];
        async.eachSeries(fields, function(slim_file_name, cb) {

            if (!req.body[slim_file_name]) {
                delete req.body[slim_file_name];
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
                delete req.body[slim_file_name];
                return cb(null);
            }

            var upload_folder = path.join('uploads');
            var filename = Date.now() + '_' + random(20);

            uploadSlimFile(current_file, upload_folder, filename, function(err, relative_path) {
                req.body[slim_file_name] = relative_path;

                var json = JSON.parse(stringified);
                var original_file = req.files[json.input.field];

                console.log("original_file", original_file);

                if (original_file.size <= 0) {
                    delete req.body[slim_file_name];
                    return cb(null);
                }

                filename += "_original";
                uploadFile(original_file, upload_folder, filename, function(err, relative_path) {
                    //delete req.body[slim_file_name];
                    // req.body[slim_file_name] = relative_path;
                    return cb(null);
                });

            });

        }, function(err) {
            if (err) { return callback(err); }

            callback(null, null, null);
        });
    }

    //req.body.available_at = moment(req.body.available_at, 'DD/MM/YYYY HH:mm');
    function convert_date(obj) {

        var avail_date = obj.split('/');
        var date 	= avail_date[0];
        var month 	= parseInt(avail_date[1]);
        var year 	= avail_date[2].split(' ')[0];

        var time 	= avail_date[2].split(' ')[1];
        obj = year+'-'+month+'-'+date+' '+time;
        console.log("Obj::", obj);
        return obj;
    }
};


exports.delete = function(req, res, next) {

    var id = req.params.id;

    mysql.delete('articles')
        .where({
            id: { o: '=', v: id }
        })
        .exec(function (row) {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        });
};
