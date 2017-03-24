'use strict';

module.exports = function(req, res, next) {

    req.checkBody('name', 'O campo nome é requerido.').notEmpty();
    req.checkBody('phone', 'O campo telefone é requerido.').notEmpty();

    if (req.body.password || req.body.password_confirmation) {
        req.checkBody('password', 'O campo Senha é requerido.').notEmpty();
        req.checkBody('password_confirmation', 'O campo Confirmação de Senha é requerido.').isLength({min: 6 , max: 15}).withMessage('A sua senha deve conter de 6 a 15 caracteres alphanuméricos.').isAlphanumeric().withMessage('A sua senha deve conter apenas caracteres alphanuméricos.').notEmpty();
        req.checkBody('password_confirmation', 'O campo confirmação de senha deve ser igual a senha.').isEqualTo(req.body.password);
    }

    next();
};