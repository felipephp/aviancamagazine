// var Model = require.main.require('./models/categoria.model');
var base_route = 'categorias';
var Slug = require('../../domain/generate-slug');
var mysql = require('../../domain/mysql-helper/mysql');

exports.index = function(req, res, next) {
    mysql.select('categories')
        .where({ categories_id: { o: '?', v: 'IS NULL' } })
        .orderBy('name')
        .exec(function (all) {
            return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
        })

};

exports.create = function(req, res, next) {
    return res.render('admin/'+base_route+'/form', {mode: "create", one: {}, base_route: base_route});
};

exports.store = function(req, res, next) {
    req.body.slug = Slug(req.body.name);

    mysql.insert('categories', req.body)
        .exec(function (rows) {
            req.flash('success', 'O registro foi criado com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

};

exports.edit = function(req, res, next) {
    mysql.select('categories')
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (row) {
            return res.render('admin/'+base_route+'/form', {mode: "edit", one: row[0], base_route: base_route});
        })

};


exports.update = function(req, res, next) {
    req.body.slug = Slug(req.body.name);

    mysql.update('categories', req.body)
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (row) {
            req.flash('success', 'O registro foi alterado com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

};


exports.delete = function(req, res, next) {
    mysql.delete('categories')
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (row) {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        })

};
