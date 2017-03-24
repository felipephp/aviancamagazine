var WeLove = require('../models/welove.model');

var async = require('async');
var path = require('path');
var random = require('../lib/random');
var uploadFile = require('../lib/upload-file');

exports.index = function(req, res, next) {

    WeLove.find({status: 'aprovado'})
        .sort('-created')
        .exec(function(err, welove) {
            if (err) { return next(err); }

            for(m in welove){
                var member = welove[m];
                if (!member.nome) {
                    member.nome = 'Sem nome';
                    member.save();
                }
            }

            console.log(welove);
            return res.render('welove', {welove: welove});
        });

}

exports.send = function(req, res, next) {

    var welove = new WeLove(req.body);

    if (!req.body.email || !req.body.origem || !req.body.destino) {
        req.flash('sa_danger', 'Por favor, preencha todos os campos');
        return res.redirect('back');
    }

    async.waterfall([
        function(cb) {
            var current_file = req.files['imagem'];

            if (current_file.size <= 0) {
                req.flash('sa_danger', 'Por favor, selecione a foto antes de enviar.')
                return res.redirect('back');
            }

            var upload_folder = path.join('uploads');
            var filename = Date.now() + '_' + random(20);

            uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
                if (err) { return next(err); }
                welove.imagem_path = relative_path;
                cb(null);
            });
        }
    ], function(err) {
        if (err) { return next(err); }

        welove.save(function(err, saved) {
            if (err) { return next(err); }
            req.flash('sa_success', 'Obrigado por enviar a sua foto pra gente! =) Assim que estiver aprovada será mostrada em nossa página.');
            return res.redirect('back');
        })

    })



};
