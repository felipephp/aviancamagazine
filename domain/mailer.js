var config = require('../config');
var mailgun = require('../lib/mailgun');

exports.anuncioAprovado = function(anuncio, seller, cb) {

    var contato_url = config.app.baseURL + '/contato';

    mailgun.sendByView(seller.email, "Anúncio Aprovado", "emails/anuncio_aprovado", {anuncio: anuncio, seller: seller, contato_url: contato_url}, function(err, results) {
        if(err) { cb(err); }
        cb(null, results);
    })

};