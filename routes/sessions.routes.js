var passport = require('passport');
var request = require('request');

var User = require('../models/user.model');


exports.loginForm = function(req, res) {
    res.render('login');
};


exports.login = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {next(err)};

        console.log("user", user);

        if (!user) {
            req.flash('danger', 'Usuário e/ou senha inválidos.');
            return res.redirect('/login');
        }

        if (!user.active) {
            req.flash('danger', 'O seu usuário está inativo. Por favor entre em contato com a equipe Popai Brasil.');
            return res.redirect('/login');
        }

        //if (!user.active) {
        //    req.flash('danger', 'O seu usuário ainda não foi ativado. Por favor, confirme sua conta clicando no link que foi enviado em seu e-mail de cadastro.');
        //    return res.redirect('/login');
        //}

        req.logIn(user, function(err) {
            if (err) { return next(err); }

            req.flash('success', 'Você foi logado com sucesso!');
            if (req.session.redirectURL) {
                var url = req.session.redirectURL;
                req.session.redirectURL = undefined;
                return res.redirect(url);
            }  else {
                return res.redirect('/area-associado');
            }
        });

    })(req, res, next);
};

exports.logout = function(req, res) {
    req.logout();
    req.flash('success', 'Você foi deslogado com sucesso!');
    return res.redirect('/login');
};
