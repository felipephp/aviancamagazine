var mongoose = require('mongoose');
var moment = require('moment');
var passwordHash = require('password-hash');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    active: {type: Boolean, default: false},
    reset_password_code: String,
    type: String, // (admin, associado)
    created_at: {type: Date, default: Date.now}
});

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {next()}
    user.password = passwordHash.generate(user.password);
    next();
});

userSchema.statics.isEmailRegistered = function(email, cb) {
    return this.findOne({email: email}, function(err, user) {
        if (err) { return cb(err); }
        if (!user) {
            cb(null, false);
        } else {
            cb(null, true);
        }
    });
};

userSchema.virtual('active_text').get(function() {
    return this.active ? "Ativo" : "Inativo";
});

userSchema.virtual('data_cadastro').get(function() {
    return moment(this.created_at).format('DD/MM/YYYY HH:mm:ss');
});


userSchema.methods.validPassword = function(password) {
    // return passwordHash.verify(password, this.password);
    return password == this.password;
};

userSchema.plugin(mongoosePaginate);

var User = mongoose.model('User', userSchema);

module.exports = User;
