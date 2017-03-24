var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var generateSlug = require('../domain/generate-slug');

var Schema = mongoose.Schema;

var schema = new Schema({
    nome: String,
    slug: String,
    categoria: {type: Schema.ObjectId, ref: 'Categoria'},
    created_at: {type: Date, default: Date.now}
}, {collection: "subcategorias"});

schema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});

schema.pre('save', function(next) {

    if (!this.slug) {
        this.slug = generateSlug(this.nome);
    }

    if (this.isModified('nome')) {
        this.slug = generateSlug(this.nome);
    }

    next();
});

schema.plugin(mongoosePaginate);

var Model = mongoose.model('Subcategoria', schema);

module.exports = Model;
