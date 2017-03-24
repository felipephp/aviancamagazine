var Model = require.main.require('./models/welove.model');
var base_route = 'welove';

exports.index = function(req, res, next) {

    Model.find({}, function(err, all) {
        if (err) { return next(err); }
        return res.render('admin/'+base_route+'/index', {all: all, base_route: base_route});
    })

};

exports.create = function(req, res, next) {

    var one = new Model;

    return res.render('admin/'+base_route+'/form', {mode: "create", one: one, base_route: base_route});
}

exports.store = function(req, res, next) {

    var one = new Model(req.body);

    one.save(function(err, saved) {
        if (err) { return next(err); }
        req.flash('success', 'O registro foi criado com sucesso!');
        return res.redirect('/admin/'+base_route);
    })

}

exports.edit = function(req, res, next) {

    var id = req.params.id;

    Model.findOne({_id: id}, function(err, one) {
        if (err) { return next(err); }
        return res.render('admin/'+base_route+'/form', {mode: "edit", one: one, base_route: base_route});
    });

}


exports.update = function(req, res, next) {

    var id = req.params.id;

    Model.findOneAndUpdate({_id: id}, {$set: req.body}, function(err, one) {
        if (err) { return next(err); }
        req.flash('success', 'O registro foi atualizado com sucesso!');
        return res.redirect('/admin/'+base_route);
    });

}


exports.delete = function(req, res, next) {

    var id = req.params.id;

    Model.findOne({_id: id}, function(err, one) {
        if (err) { return next(err); }

        one.remove(function(err) {
            req.flash('success', 'O registro foi excluido com sucesso!');
            return res.redirect('/admin/'+base_route);
        });

    });

}
