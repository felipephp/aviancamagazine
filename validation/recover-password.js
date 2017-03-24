'use strict';

module.exports = function(req, res, next) {

    req.checkBody('email', 'É necessário digitar seu e-mail de cadastro para recuperar a sua senha.').notEmpty();
    next();
};