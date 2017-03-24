var Model = require.main.require('./models/subcategoria.model');
var Categoria = require.main.require('./models/categoria.model');
var base_route = 'subcategorias';

var async = require('async');

exports.index = function(req, res, next) {

    Model.find({})
        .populate('categoria')
        .exec(function(err, all) {
            if (err) { return next(err); }
            return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
        })

};

exports.create = function(req, res, next) {

    var one = new Model;

    Categoria.find({})
        .sort('nome')
        .exec(function(err, categorias) {
            if (err) { return next(err); }
            return res.render('admin/'+base_route+'/form', {mode: "create", one: one, base_route: base_route, categorias: categorias});
        })


}

exports.store = function(req, res, next) {

    var one = new Model(req.body);

    async.waterfall([
        function(cb) {
            one.save(function(err, saved) {
                if (err) { return cb(err); }
                cb(null, saved);
            })
        },
        function(subcategoria, cb) {
            console.log("subcategoria", subcategoria);
            Categoria.findOne({_id: subcategoria.categoria})
                .exec(function(err, categoria) {
                    if (err) { return cb(err); }
                    console.log("categoria", categoria);
                    categoria.subcategorias.push(subcategoria._id);
                    cb(null, categoria);
                });
        },
        function(categoria, cb) {
            categoria.save(function(err, saved) {
                if (err) { return cb(err); }
                cb(null);
            });
        }
    ], function(cb) {
        req.flash('success', 'O registro foi criado com sucesso!');
        return res.redirect('/admin/'+base_route);
    })

}

exports.edit = function(req, res, next) {

    var id = req.params.id;

    Categoria.find({})
        .sort('nome')
        .exec(function(err, categorias) {
            if (err) { return next(err); }
            Model.findOne({_id: id}, function(err, one) {
                if (err) { return next(err); }
                return res.render('admin/'+base_route+'/form', {mode: "edit", one: one, base_route: base_route, categorias: categorias});
            });
        })




}


exports.update = function(req, res, next) {

    var id = req.params.id;

    Model.findOne({_id: id})
        .exec(function(err, one) {
            if (err) { return next(err); }
            one.nome = req.body.nome;
            one.save(function(err, saved) {
                if (err) { return next(err); }
                req.flash('success', 'O registro foi atualizado com sucesso!');
                return res.redirect('/admin/'+base_route);
            })
        });

}


exports.delete = function(req, res, next) {

    var id = req.params.id;

    async.waterfall([
        function(cb) {
            Model.findOne({_id: id}, function(err, one) {
                if (err) { return cb(err); }
                one.remove(function(err) {
                    cb(null, one);
                });
            });
        },
        function(subcategoria, cb) {

            Categoria.findOne({_id: subcategoria.categoria})
                .exec(function(err, categoria) {
                    if (err) { return cb(err); }
                    var index = categoria.subcategorias.indexOf(id);
                    categoria.subcategorias.splice(index, 1);
                    cb(null, categoria);
                })
        },
        function(categoria, cb) {
            categoria.save(function(err, saved) {
                if (err) { return cb(err); }
                cb(null);
            })
        }
    ], function(err) {
        if (err) { return next(err); }
        req.flash('success', 'O registro foi excluido com sucesso!');
        return res.redirect('/admin/'+base_route);
    })



}
