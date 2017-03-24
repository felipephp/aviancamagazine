var Model = require.main.require('./models/config.model');

var async = require('async');
var path = require('path');
var uploadFile = require.main.require('./lib/upload-file');
var random = require.main.require('./lib/random');
var uploadSlimFile = require.main.require('./lib/upload-slim-file');

var keys = [
    'social1_titulo', 'social1_imagem_path',
    'social2_titulo', 'social2_imagem_path',
    'social3_titulo', 'social3_imagem_path',
    'social4_titulo', 'social4_imagem_path',
    'social5_titulo', 'social5_imagem_path',
    'social6_titulo', 'social6_imagem_path',
    'social7_titulo', 'social7_imagem_path',
    'social8_titulo', 'social8_imagem_path',
    'social9_titulo', 'social9_imagem_path',
    'social10_titulo', 'social10_imagem_path',
    'social11_titulo', 'social11_imagem_path',
    'social12_titulo', 'social12_imagem_path',
    'social13_titulo', 'social13_imagem_path',
    'social14_titulo', 'social14_imagem_path',
    'social15_titulo', 'social15_imagem_path',
    'social16_titulo', 'social16_imagem_path',
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
        return res.render('admin/config/social', {configs: configs});
    });

};

exports.update = function(req, res, next) {

    var fields = [
        'social1_imagem', 'social2_imagem', 'social3_imagem', 'social4_imagem', 'social5_imagem',
        'social6_imagem', 'social7_imagem', 'social8_imagem', 'social9_imagem', 'social10_imagem',
        'social11_imagem', 'social12_imagem', 'social13_imagem', 'social14_imagem', 'social15_imagem',
        'social16_imagem'
];

    var configs = {};

    async.eachSeries(fields, function(slim_file_name, cb) {

        if (!req.body[slim_file_name]) {
            return cb(null);
        }

        var stringified = "";

        if (typeof req.body[slim_file_name] == "object") {
            stringified = req.body[slim_file_name][0]
        } else {
            stringified = req.body[slim_file_name]
        }

        var current_file = JSON.parse(stringified).output;

        if (!current_file) {
            return cb(null);
        }

        var upload_folder = path.join('uploads');
        var filename = Date.now() + '_' + random(20);

        uploadSlimFile(current_file, upload_folder, filename, function(err, relative_path) {
            configs[slim_file_name+'_path'] = relative_path;

            var json = JSON.parse(stringified);
            var original_file = req.files[json.input.field];

            console.log("original_file", original_file);

            if (original_file.size <= 0) {
                return cb(null);
            }

            filename += "_original";
            uploadFile(original_file, upload_folder, filename, function(err, relative_path) {
                return cb(null);
            });

        });

    }, function(err) {
        if (err) { return next(err); }

        async.each(keys, function(key, cb) {

            Model.findOne({key: key})
                .exec(function(err, config) {
                    if (err) { return next(err); }

                    if (!config) {
                        config = new Model({key: key});
                    }

                    if (configs[key]) {
                        config.value = configs[key];
                    } else if (req.body[key]) {
                        config.value = req.body[key];
                    }

                    config.save(function(err, saved) {
                        if (err) { return next(err); }
                        return cb(null);
                    })
                })

        }, function(err) {
            if (err) { return next(err); }
            req.flash('success', 'Configurações atualizadas com sucesso!');
            return res.redirect('/admin/config/social');
        });

    });



}
