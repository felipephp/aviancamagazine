var Model = require.main.require('./models/config.model');

var async = require('async');

var keys = [
    'video1_name', 'video1_url',
    'video2_name', 'video2_url',
    'video3_name', 'video3_url',
    'video4_name', 'video4_url',
    'video5_name', 'video5_url'
];

exports.index = function(req, res, next) {

    var configs = {};

    async.each(keys, function(key, cb) {

        Model.findOne({key: key})
            .exec(function(err, config) {
                if (err) { return next(err); }
                configs[key] = config ? config.value : '';
                return cb(null);
            })

    }, function(err) {
        return res.render('admin/config/video', {configs: configs});
    });

};

exports.update = function(req, res, next) {

    async.each(keys, function(key, cb) {

        Model.findOne({key: key})
            .exec(function(err, config) {
                if (err) { return next(err); }

                if (!config) {
                    config = new Model({key: key});
                }

                config.value = req.body[key];
                config.save(function(err, saved) {
                    if (err) { return next(err); }
                    return cb(null);
                })
            })

    }, function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Configurações atualizadas com sucesso!');
        return res.redirect('/admin/config/videos');
    });

}
