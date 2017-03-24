var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var generateSlug = require('../domain/generate-slug');

var schema = new mongoose.Schema({
    nome: String,
    youtube_code: String,
    miniatura_path: String,
    ordem: Number,
    slug: String,
    created_at: {type: Date, default: Date.now}
}, {collection: "videos"});

schema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});

schema.plugin(mongoosePaginate);

schema.pre('save', function(next) {

    if (!this.slug) {
        this.slug = generateSlug(this.nome);
    }

    next();
});

var Model = mongoose.model('Video', schema);

module.exports = Model;
