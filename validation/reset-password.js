'use strict';

module.exports = function(req, res, next) {

    req.checkBody('password', 'O campo Senha Nova é requerido.').isLength({min: 6 , max: 15}).withMessage('A sua senha deve conter de 6 a 15 caracteres.').notEmpty();
    req.checkBody('password_confirmation', 'O campo confirmação de senha deve ser igual a senha.').isEqualTo(req.body.password);

    next();
};