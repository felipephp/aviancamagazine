var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var schema = new mongoose.Schema({
    numero: String,
    titulo: String,
    capa_path: String,
    link_online: String,
    created_at: {type: Date, default: Date.now}
}, {collection: "edicoes"});

schema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});

schema.plugin(mongoosePaginate);

var Model = mongoose.model('Edicao', schema);

module.exports = Model;
