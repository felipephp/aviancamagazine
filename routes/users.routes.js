var path = require('path');
var uploadFile = require('../lib/upload-file');

var User = require('../models/user.model');

var mailer = require('../domain/mailer');
var random = require('../lib/random');

var request = require('request');


exports.registerForm = function(req, res) {
    res.render('site/cadastro');
};

var uploadAvatarIfExists = function(files, callback) {
    if (files.avatar.size) {
        var upload_folder = path.join('uploads', 'users');
        var filename = Date.now() + '_' + random(20);

        var current_file = files.avatar;
        uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
            callback(null, relative_path);
        });
    } else {
        callback(null, null);
    }
};

exports.register = function(req, res, next) {

    User.isEmailRegistered(req.body.email, function(err, isRegistered) {
        if (err) { return next(err); }

        if (isRegistered) {
            req.flash('danger', "Este e-mail já está cadastrado em nosso sistema. <a href='/recuperar-senha'>Esqueceu sua senha? Clique aqui para redefini-la.</a>");
            return res.redirect("back");
        } else {

            var user = new User;
            user.email = req.body.email;
            user.password = req.body.password;
            user.name = req.body.name;
            user.cpf = req.body.cpf;
            user.phone = req.body.phone;
            user.nascimento = req.body.nascimento;
            user.type = 3; // Uusário comum

            user.activation_token = random(25);

            uploadAvatarIfExists(req.files, function(err, avatar_path) {

                if (avatar_path) {
                    user.avatar_path = avatar_path;
                }

                user.save(function(err, savedUser) {
                    if (err) {return next(err);};

                    mailer.sendConfirmacaoEmail(savedUser, function(err, results) {
                        if (err) { return next(err); }

                        req.logIn(user, function(err) {
                            if (err) { return next(err); }
                            req.flash('sa_success', 'Parabéns! O usuário foi criado com sucesso porém a sua conta ainda não está ativa, por favor confirme sua conta clicando no link que foi enviado para o seu e-mail.');

                            if (req.session.redirectURL) {
                                return res.redirect(req.session.redirectURL)
                            } else {
                                return res.redirect('/anuncios/bovinos');
                            }

                        });

                    });
                });

            });




        }
    });


};

//exports.register = function(req, res, next) {
//
//    var options = {
//        url: req.api_base_url+'/api/users',
//        headers: {
//            'Accept': req.accept_header
//        },
//        form: {
//            accept: req.accept_header,
//            name: req.body.name,
//            email: req.body.email,
//            password: req.body.password,
//            password_confirmation: req.body.password_confirmation,
//            phone: req.body.phone
//        }
//    };
//
//    request.post(options, function(error, response, body) {
//        console.log("statusCode");
//        console.log(response.statusCode);
//        if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
//            var response = JSON.parse(body);
//            console.log("success response");
//            console.log(response);
//
//            var user = new User;
//            user.name = response.name;
//            user.original_id = response.id;
//            user.email = response.email;
//            user.authentication_token = response.authentication_token;
//            user.phone = response.phone;
//            user.avatar_url = response.avatar_url;
//            user.save(function(err, savedUser) {
//                if (err) { return next(err); }
//
//                req.logIn(user, function(savedUser) {
//                    if (err) { return next(err); }
//
//                    req.flash('success', 'Você foi logado com sucesso!');
//                    return res.redirect('/minha-conta');
//                });
//
//            });
//
//        } else {
//            var response = JSON.parse(body);
//            console.log("error response:");
//            console.log(response);
//            req.flash('danger', response.message);
//            return res.redirect("back");
//        }
//    });
//
//
//};

exports.confirmar = function(req, res) {

    User.findOne({confirmation_code: req.query.code}, function(err, user) {

        if (err) { return next(err); }

        if (!user) {
            req.flash('danger', 'O link de confirmação não foi encontrado ou sua conta já foi ativada. Por favor, tente fazer o login.');
            return res.redirect('/login');
        }

        user.active = true;
        user.confirmation_code = "";
        user.save(function(err, userSaved) {
            if (err) { return next(err); }
            req.flash('success', 'A sua conta foi ativada com sucesso! Você já pode fazer login.');
            return res.redirect('/login');
        });

    });

};

exports.recoverPasswordPage = function(req, res, next) {
    return res.render("site/recuperar-senha");
};

exports.recoverPassword = function(req, res, next) {

    User.findOne({email: req.body.email}, function(err, user) {
        if (err) { return next(err); }
        console.log(user);
        if (!user) {
            req.flash("danger", "E-mail não encontrado no banco de dados.")
            return res.redirect("back");
        } else {

            var resetPasswordCode = random(25);

            user.reset_password_code = resetPasswordCode;
            user.save();

            mailer.sendResetPasswordRequest(user);

            req.flash("success", "Sucesso! Foi enviado um e-mail de confirmação com um link em seu e-mail.")
            return res.redirect("back");

        }
    });

};

exports.resetPasswordPage = function(req, res, next) {

    User.findOne({reset_password_code: req.query.code}, function(err, user) {
        if (err) { return next(err); }

        if (!user) {
            req.flash("danger", "Código de redefinição inválido!");
            return res.redirect("recuperar-senha");
        } else {
            return res.render("site/redefinir-senha", {code: req.query.code, email: user.email});
        }


    });

};


exports.resetPassword = function(req, res, next) {

    User.findOne({reset_password_code: req.body.code}, function(err, user) {
        if (err) { return next(err); }
        console.log(user);
        if (!user) {
            req.flash("danger", "Erro - não foi possível efetuar a transação.");
            return res.redirect("back");
        } else {

            user.password = req.body.password;
            user.reset_password_code = "";
            user.save(function(err, user) {
                if (err) { return next(err); }
                req.flash("success", "A sua senha foi redefinida com sucesso. Você já pode fazer o login.");
                return res.redirect("/login");
            });


        }
    });

};