'use strict';

module.exports = function(req) {

    req.checkBody('username', 'Please provide your username').notEmpty();
    req.checkBody('password', 'Please provide your password').notEmpty();

    return req;
};