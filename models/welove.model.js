var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var schema = new mongoose.Schema({
    nome: String,
    email: String,
    origem: String,
    destino: String,
    imagem_path: String,
    status: {type: String, default: "aguardando_aprovacao"},
    created_at: {type: Date, default: Date.now}
}, {collection: "welove"});

schema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});

schema.virtual('status_text').get(function() {
    return this.status == 'aprovado' ? 'Aprovado' : 'Aguardando Aprovação';
});


schema.plugin(mongoosePaginate);

var Model = mongoose.model('WeLove', schema);

module.exports = Model;
