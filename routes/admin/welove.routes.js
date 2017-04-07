var Model = require.main.require('./models/welove.model');
var base_route = 'welove';
var mysql = require('../../domain/mysql-helper/mysql');

exports.index = function(req, res, next) {

    mysql.select('welove')
        .orderBy('created_at')
        .exec(function (rows) {
            return res.render('admin/'+base_route+'/index', {all: rows, base_route: base_route});
        });
};

exports.create = function(req, res, next) {

    var one = new Model;
    return res.render('admin/'+base_route+'/form', {mode: "create", one: one, base_route: base_route});
};

exports.store = function(req, res, next) {

    var one = new Model(req.body);
    one.save(function(err, saved) {
        if (err) { return next(err); }
        req.flash('success', 'O registro foi criado com sucesso!');
        return res.redirect('/admin/'+base_route);
    })
};

exports.edit = function(req, res, next) {
    var id = req.params.id;
    mysql.select('welove')
        .where({ id: { o: '=', v: id } })
        .exec(function (row) {
            return res.render('admin/'+base_route+'/form', {mode: "edit", one: row[0], base_route: base_route});
        })
};


exports.update = function(req, res, next) {
    mysql.update('welove', req.body)
        .where({ id: { o: '=', v: req.params.id } })
        .exec(function (row) {
            req.flash('success', 'O registro foi atualizado com sucesso!');
            return res.redirect('/admin/'+base_route);
        })
};


exports.delete = function(req, res, next) {
    var id = req.params.id;
    mysql.delete('welove')
        .where({ id: { o: '=', v:id } })
        .exec(function () {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        });
};
