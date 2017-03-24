var Materia = require('../models/materia.model');

exports.go = function(req, res, next) {

    var query = req.query.q;

    console.log("query", query);

    var mongoose_query = { $or: [
        {"titulo": { $regex: new RegExp(query.toLowerCase(), "i") }},
        {"conteudo": { $regex: new RegExp(query.toLowerCase(), "i") }}
    ]}

    console.log("mongoose_query", mongoose_query);

    Materia.find(mongoose_query)
        .populate(['categoria', 'subcategoria'])
        .sort('-created_at')
        .exec(function(err, materias) {
            if (err) { return next(err); }
            return res.render("busca", {materias: materias, q: query});
        })

}
