var mongoose = require('mongoose');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var schema = new mongoose.Schema({
    nome: String,
    created_at: {type: Date, default: Date.now}
}, {collection: "tags"});

schema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});

schema.plugin(mongoosePaginate);

var Model = mongoose.model('Tag', schema);

module.exports = Model;
