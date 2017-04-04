// var Materia = require('../models/materia.model');
var mysql = require('../domain/mysql-helper/mysql');
var myHelper = require('../lib/articles_helper');

exports.go = function(req, res, next) {

    var word = req.query.q;
    mysql.select('articles')
        .where({
            content: { o: 'LIKE', v: '%'+word+'%' },
            besides: 'OR',
            title: { o: 'LIKE', v: '%'+word+'%' }
        })
        .limit(200)
        .exec(function (materias) {
            myHelper.getShowInfoMany(materias, 400);
            return res.render("busca", {materias: materias, q: word});
        })
};
