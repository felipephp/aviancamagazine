var Categoria = require('../models/categoria.model');
// var Subcategoria = require('../models/subcategoria.model');
// var Tag = require('../models/tag.model');
// var Materia = require('../models/materia.model');

var async = require('async');
var mysql = require('../domain/mysql-helper/mysql');
var Articles = require('../models/sql_articles');
var myHelper = require('../lib/articles_helper');
var $this = this;

exports.porCategoria = function(req, res, next) {
    var categoria_slug = req.params.categoria_slug;
    async.waterfall([
        function (cb) {
            mysql.select('categories')
                .where({ slug: { o: '=', v: categoria_slug } })
                .exec(function (row) {
                    if (!row[0]) {
                        console.log('********************mysql error por Categoria!!!');
                        res.render('Error.');
                        //return res.render("categoria", {categoria: categoria, materias: materias});
                    }

                    cb(null, row[0]);
                })
        },
        function (categoria, cb) {
            Articles.from('category').getArticle(categoria.id, 400, function (rows) {
                cb(null, categoria, rows);
            })
        }
    ], function(cb, categoria, materias) {
        return res.render("categoria", {categoria: categoria, materias: materias});
    })


};

exports.porSubcategoria = function(req, res, next) {

    var categoria_slug = req.params.categoria_slug;
    var subcategoria_slug = req.params.subcategoria_slug;

    async.waterfall([
        function (cb) {
            mysql.select('categories')
                .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS categoria', 'slug AS cat_slug'] })
                .where({ slug: { alias: 'A', o: '=', v: subcategoria_slug } })
                .exec(function (row) {
                    if (!row[0]) {
                        console.log('********************mysql error por Sub!!!');
                        res.render('Error.');
                    }
                    cb(null, row[0]);
                })
        },
        function (subcategoria, cb) {
            Articles.from('subcategory').getArticle(subcategoria.id, 600, function (rows) {
                cb(null, subcategoria, rows);
            })
        }

    ], function(cb, subcategoria, materias) {
        return res.render("subcategoria", {subcategoria: subcategoria, materias: materias});
    })


};

exports.porTag = function(req, res, next) {

    var tag_slug = req.params.tag_slug;

    async.waterfall([
        function (cb) {
            mysql.select('tags')
                .where({ slug: { o: '=', v: tag_slug } })
                .exec(function (tag) {
                    tag = tag[0];
                    cb(null, tag);
                })
        },
        function(tag, cb) {
            if (!tag) {
                return next();
            }
            mysql.select('articles_has_tags', null)
                .join({ table: 'articles', on: 'id', key: 'A.articles_id', columns: ['*'] })
                .join({ table: 'categories', on: 'id', key: 'B.categories_id', columns: ['name AS subcat'] })
                .join({ table: 'categories', on: 'id', key: 'C.categories_id', columns: ['name AS categorie'] })
                .where({ tags_id: { o: '=', v: tag.id } })
                .exec(function (materias) {
                    myHelper.getShowInfoMany(materias, 400);
                    console.log("Materias::", materias);
                    cb(null, tag, materias);
                })
        }
    ], function(cb, tag, materias) {
        return res.render("tag", {tag: tag, materias: materias});
    })

};

exports.editPost = function (req, res, next) {
    // $this = this;
    console.log('pr::', req.params);
    console.log('bd::', req.body);
    mysql.select('articles')
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (row) {
            //return 'Thats ok';
            var row = row[0];
            //req.params.slug = row.slug;
            req.params.isAdmin = true;
            req.params.post = row;
            return $this.mostrar(req, res, next);
        });

    // return this.mostrar(req, res, next);
};

exports.mostrar = function(req, res, next) 
{
    //var editArticle;
    var slug = req.params.slug;

    var createGlobalGroup = function(socket, data) 
    {
        async.waterfall(
        [
            /**
             * this function is required to pass data recieved from client
             * @param  {Function} callback To pass data recieved from client
             */

            function(callback) {
                callback(null, socket, data);
            },

            findArticle,
            getRels,
            author,
            end

        ]
        ,function(err, result) {
            /**
             * function to be called when all functions in async array has been called
             */
            return res.render("materia", result );
        });
    };

    findArticle = function(socket, data, callback) 
    {
        if (req.params.post) {
            console.log('her!');
            var row = req.params.post;
            Articles.from('articles').getArticle(row.id, function (article) {
                article = article[0];
                callback(null, socket, { materia: article });
            })
        }else{
            mysql.select('articles')
                .where({ slug: { o: '=', v: slug } })
                .limit(1)
                .exec(function (row) {

                    row = row[0];
                    Articles.from('articles').getArticle(row.id, function (article) {
                        article = article[0];
                        callback(null, socket, { materia: article });
                    })
                })
        }
    };

    getRels = function (socket, data, callback) {
        mysql.select('articles')
            .where({ categories_id: { o: '=', v:data.materia.categories_id }  })
            .limit(3)
            .orderBy("RAND()")
            .exec(function (rows) {
                for(var idx in rows)
                {
                    myHelper.getShowInfo(rows[idx]);
                }
                data.rels = rows;
                callback(null, socket, data);
            })

    };

    author = function (socket, data, callback) {
        mysql.select('authors')
            .where({ id: { o: '=', v: data.materia.authors_id } })
            .exec(function (row) {
                row = row[0];
                data.author = row;
                callback(null, socket, data);
            })
    };

    end = function (socket, data, callback) {
        if (req.params.isAdmin) {
            console.log('ok, is admin!');
            data.isAdmin = true;
            req.params.post.contentToolsOnSave = 'post.update';
            data.post = JSON.stringify(req.params.post);
        }else{
            console.log('No! =(');
        }
        callback(null, data);
    };

    createGlobalGroup();
};

exports.saveEdit = function (req, res, next) {
    var id = parseInt(req.body.id);
    var regions = req.body.regions;
    console.log('regions::', req.body);

    mysql.update('articles', { content: regions.article_content.content })
        .where({ id: { o:'=', v: id } })
        .exec(function (row) {
            res.send({ message: 'update', edited: true });
        });

    // res.send('Hello!');
};

exports.saveEdit = function (req, res, next) {
    var id = parseInt(req.body.id);
    var regions = req.body.regions;
    console.log('regions::', req.body);

    mysql.update('articles', { content: regions.article_content.content })
        .where({ id: { o:'=', v: id } })
        .exec(function (row) {
            res.send({ message: 'update', edited: true });
        });

    // res.send('Hello!');
};

exports.postImageUpload = function (req, res, next) {
    console.log('Here!!', req.body);
    return res.send('end...');
};

exports.porSubcategoriaApi = function(req, res, next) {

    // console.log('PR::', req.body);
    var subcategoria_id = req.body.id;
    var limit = parseInt(req.body.limit);

    mysql.select('articles')
        .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS main_categ_name'] })
        .where({categories_id: { alias: 'A', o: '=', v: subcategoria_id } })
        .limit(limit)
        .orderBy('available_at DESC')
        .exec(function (materias) {
            // console.log("RESLTS:: ", materias);
            return res.send({results: materias});
        });
};

exports.porCategoriaApi = function(req, res, next) {

    var id = req.body.id;
    console.log('id::', id);
    var limit = parseInt(req.body.limit);

    mysql.select('categories', ['name AS main_categ_name'])
        .join({ table: 'articles', on: 'categories_id', key: 'A.id', columns: ['*'] })
        .where({ categories_id: { alias: 'A', o: '=', v: id } })
        .orderBy('B.available_at DESC')
        .limit(limit)
        .exec(function (rows) {
            console.log("MA::", rows);
            return res.send({results: rows});
        })

};
