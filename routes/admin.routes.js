var passport = require('passport');
var User = require('../models/user.model');

exports.dashboard = function(req, res) {
    // return res.redirect('/admin/associados');
    return res.render('admin/dashboard');
};


exports.form = function(req, res) {
    return res.render('admin/form');
};

exports.tables = function(req, res) {
    return res.render('admin/tables');
};


exports.loginForm = function(req, res) {
    res.render('admin/login');
};


exports.login = function(req, res, next) {
    passport.authenticate('local-admin', function(err, user, info) {
        if (err) {next(err)};

        if (!user) {
            req.flash('danger', 'Usuário e/ou senha inválidos.');
            return res.redirect('/admin/login');
        }

        if (user.type != 'admin') {
            req.flash('danger', 'Você não possui permissão para entrar na administração.');
            return res.redirect('/admin/login');
        }

        req.logIn(user, function(err) {
            if (err) { return next(err); }
            req.flash('success', 'Você foi logado com sucesso!');
            return res.redirect('/admin');
        });

    })(req, res, next);
};
