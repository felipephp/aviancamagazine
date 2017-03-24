var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var generateSlug = require('../domain/generate-slug');

var striptags = require('striptags');

var Schema = mongoose.Schema;

var schema = new Schema({

    titulo: String,
    conteudo: String,
    imagem_principal_path: String,

    titulo_chamada: String,
    conteudo_chamada: String,
    imagem_chamada_path: String,

    autor: {type: Schema.ObjectId, ref: 'Autor'},
    categoria: {type: Schema.ObjectId, ref: 'Categoria'},
    subcategoria: {type: Schema.ObjectId, ref: 'Subcategoria'},

    edicao: {type: Schema.ObjectId, ref: 'Edicao'}, // N obrigatório
    tags: [{type: Schema.ObjectId, ref: 'Tag'}], // N obrigatório
    localizacao: {type: Schema.ObjectId, ref: 'Localizacao'}, // N obrigatório

    slug: String,

    available_at: Date,
    created_at: {type: Date, default: Date.now}
}, {collection: "materias", toObject: {virtuals: true}, toJSON: {virtuals: true}});

schema.virtual('info_titulo').get(function() {
    return this.titulo_chamada && this.titulo_chamada != "" ? this.titulo_chamada : this.titulo;
});

schema.virtual('info_conteudo').get(function() {
    var thisVirtual = 
        this.conteudo_chamada && this.conteudo_chamada != "" 
            ? 
                this.conteudo_chamada 
            : 
            this.conteudo 
                ?
                    striptags(this.conteudo.substr(0, 200))
                :
                    '';
    
    return thisVirtual;
});

schema.virtual('info_imagem').get(function() {
    return this.imagem_chamada_path && this.imagem_chamada_path != "" ? this.imagem_chamada_path : this.imagem_principal_path;
});



schema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});

schema.virtual('data_postagem').get(function() {
    return moment(this.available_at).format('DD/MM/YYYY HH:mm');
});

schema.pre('save', function(next) {

    if (!this.slug) {
        this.slug = generateSlug(this.titulo);
    }

    next();
});
schema.plugin(mongoosePaginate);
schema.plugin(deepPopulate);

var Model = mongoose.model('Materia', schema);

module.exports = Model;
