var mongoose = require('mongoose');
var moment = require('moment');

var schema = new mongoose.Schema({
    key: String,
    value: String,
}, {collection: "configs"});

var Model = mongoose.model('Config', schema);

module.exports = Model;
