// var Model = require.main.require('./models/edicao.model');
var base_route = 'social';

var path = require('path');
var async = require('async');
var uploadFile = require.main.require('./lib/upload-file');
var random = require.main.require('./lib/random');

var mysql = require('../../domain/mysql-helper/mysql');
var uploadSlimFile = require.main.require('./lib/upload-slim-file');

exports.index = function(req, res, next) {

    mysql.select('social')
        //.orderBy('editions_id DESC')
        .exec(function (all) {
            return res.render('admin/'+base_route+'/form', {all: all, base_route: base_route});
        });
};

// exports.create = function(req, res, next) {
//
//     //var one = new Model;
//     var one = {};
//
//     return res.render('admin/'+base_route+'/form', {mode: "create", one: one, base_route: base_route});
// };

exports.store = function(req, res, next) {

    async.eachSeries(req.body.social, function (reg, cb) {

        if (reg.imagem != '') {
            if (reg.id > 0) {
                //Deletar foto antiga
                mysql.select('social', ['img_path'])
                    .where({ id: { o: '=', v: reg.id } })
                    .exec(function (img_path) {
                        img_path = img_path[0];
                        //TODO - deletar foto antiga AQUI!
                        upImg(reg, cb)
                    })
            }else{
                upImg(reg, cb)
            }
        }else{
            //If there isn't image, allow only update, because image is required.
            if (reg.id > 0) {
                var id = reg.id;
                delete reg.id;
                // delete reg.imagem;
                update(reg, id, cb);
            }else{
                cb(null);
            }
        }

        //cb(null);
        // console.log('Reg is::', req.body.social[idx]);
    }, function (err) {
        return res.redirect('/admin/'+base_route);
    });

    function upImg(reg, callback) {
        var upload_folder = path.join('uploads/social');
        console.log('ToJson::', reg.imagem);
        var json = JSON.parse(reg.imagem);
        var original_file = req.files[ json.input.field ];
        var filename = Date.now() + '_' + random(20);

        //Finalmente, usar aqui uma função assincrona. Deletar a foto velha caso seja upload

        uploadSlimFile(json.output, upload_folder, filename, function(err, relative_path) {

            filename += "_original";
            uploadFile(original_file, upload_folder, filename, function(err, relative_path) {

                reg.img_path = relative_path;
                insertOrUpdate(reg, callback);

            });

        });
    }

    function insertOrUpdate(reg, callback) {
        var id = reg.id;
        delete reg.imagem;
        delete reg.id;
        ( id > 0 ) ? update(reg, id, callback) : insert(reg, callback);
    }

    function insert(data, cb) {
        delete data.id;
        delete data.imagem;
        mysql.insert('social', data)
            .exec(function (row) {
                console.log('\nRegistro sem img criado.', reg);
                cb(null);
                i++;
            })
    }

    function update(data, id, cb) {
        delete data.imagem;
        mysql.update('social', data)
            .where({ id: { o: '=', v: id } })
            .exec(function (row) {
                console.log('\nRegistro sem img alterado.', reg);
                cb(null);
                //i++;
            })
    }

    return;
    var data = req.body.social;
    console.log('LENG::', data.length);
    var wait = false;
    var i = 1;
    for(var idx in data){
        var reg = data[idx];
        // console.log('IDX::',reg);

        //If image uploaded
        if ( reg.imagem != '' ) {
            wait = true;

            var json = JSON.parse(reg.imagem);
            delete reg.imagem;
            var original_file = req.files[ json.input.field ];

            (function (json, original_file, reg) {
                var upload_folder = path.join('uploads/social');
                var filename = Date.now() + '_' + random(20);

                uploadSlimFile(json.output, upload_folder, filename, function(err, relative_path) {

                    filename += "_original";
                    uploadFile(original_file, upload_folder, filename, function(err, relative_path) {
                        reg.img_path = relative_path;
                        if ( reg.id > 0 )
                        {
                            mysql.update('social', reg)
                                .where({ id: { o: '=', v: id } })
                                .exec(function (row) {
                                    console.log('\nRegistro sem img alterado.', reg);
                                    i++;
                                })
                        }
                        else
                        {
                            mysql.insert('social', reg)
                                .exec(function (row) {
                                    console.log('\nRegistro sem img alterado.', reg);
                                    i++;
                                })
                        }

                        console.log('\ninserir o registro com imagem aqui', reg);
                        console.log('i::', i);
                        //i++;
                        if (i == data.length+1) {
                            console.log('\n =========================================================== Go!');
                            return res.redirect('/admin/'+base_route);
                        }
                    });

                });
            })(json, original_file, reg);
        }else{
            delete reg.imagem;

            //Para registros inexistentes, se não houve imagem, manter sem cadastro
            if (reg.id > 0) {

                var id = reg.id;
                delete reg.id;
                mysql.update('social', reg)
                    .where({ id: { o: '=', v: id } })
                    .exec(function (row) {
                        console.log('\nRegistro sem img alterado.', reg);
                        i++;
                    })
            }
        }
    }

    if (!wait){
        return res.redirect('/admin/'+base_route);
    }

    // function isNext((i) {
    //
    // }


    // var current_file = req.files['capa'];
    //
    // if (current_file.size <= 0) {
    //     req.flash('danger', 'Por favor, selecione a imagem da capa.');
    //     return res.redirect('back');
    // }
    //
    // var upload_folder = path.join('uploads');
    // var filename = Date.now() + '_' + random(20);
    //
    // uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
    //     if (err) { return next(err); }
    //     one.img_path = relative_path;
    //
    //     mysql.insert('editions', req.body)
    //         .exec(function (rows) {
    //             id = rows.insertId;
    //             // callback(null, socket, data);
    //             req.flash('success', 'O registro foi criado com sucesso!');
    //             return res.redirect('/admin/'+base_route);
    //         });
    // });
};

// exports.edit = function(req, res, next) {
//
//     var id = req.params.id;
//
//     mysql.select('editions')
//         .where({ id: { o:'=', v: id } })
//         .exec(function (rows) {
//             return res.render('admin/'+base_route+'/form', {mode: "edit", one: rows[0], base_route: base_route});
//         });
// };


// exports.update = function(req, res, next) {
//
//     async.waterfall([
//         function(cb) {
//             var current_file = req.files['capa'];
//
//             if (current_file.size <= 0) {
//                 return cb(null);
//             }
//
//             var upload_folder = path.join('uploads');
//             var filename = Date.now() + '_' + random(20);
//
//             uploadFile(current_file, upload_folder, filename, function(err, relative_path) {
//                 if (err) { return next(err); }
//                 req.body.img_path = relative_path;
//                 cb(null);
//             });
//         }
//     ], function(err) {
//         if (err) { return next(err); }
//
//         mysql.update('editions', req.body)
//             .where({ id: { o: '=', v: req.params.id } })
//             .exec(function (row) {
//                 req.flash('success', 'O registro foi alterado com sucesso!');
//                 return res.redirect('/admin/'+base_route);
//             });
//     })
//
// };
//
//
// exports.delete = function(req, res, next) {
//
//     var id = req.params.id;
//
//     mysql.delete('editions')
//         .where({ id: { o: '=', v: id } })
//         .exec(function () {
//             req.flash('success', 'O registro foi excluido com sucesso!');
//             return res.redirect('/admin/'+base_route);
//         });
// };
