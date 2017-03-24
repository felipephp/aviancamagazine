var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var schema = new mongoose.Schema({
    nome: String,
    cargo: String,
    mini_cv: String,
    avatar_path: String,
    created_at: {type: Date, default: Date.now}
}, {collection: "autores"});

schema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});

schema.plugin(mongoosePaginate);

var Model = mongoose.model('Autor', schema);

module.exports = Model;
