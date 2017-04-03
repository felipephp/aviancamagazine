var Model = require.main.require('./models/localizacao.model');
var base_route = 'localizacoes';
var mysql = require('../../domain/mysql-helper/mysql');

exports.index = function(req, res, next) {

    mysql.select('locations')
        .orderBy('name')
        .exec(function (all) {
            return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
        })
};

exports.create = function(req, res, next) {
    return res.render('admin/'+base_route+'/form', {mode: "create", one: {}, base_route: base_route});
};

exports.store = function(req, res, next) {

    mysql.insert('locations', req.body)
        .exec(function (rows) {
            id = rows.insertId;
            req.flash('success', 'O registro foi criado com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

};

exports.edit = function(req, res, next) {

    mysql.select('locations')
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (row) {
            return res.render('admin/'+base_route+'/form', {mode: "edit", one: row[0], base_route: base_route});
        })

};

exports.update = function(req, res, next) {

    mysql.update('locations', req.body)
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (rows) {
            id = rows.insertId;
            req.flash('success', 'O registro foi atualizado com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

};

exports.delete = function(req, res, next) {

    mysql.delete('locations')
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (r) {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

};
