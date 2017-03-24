var async = require('async');

var Materia = require('../models/materia.model');
var Edicao = require('../models/edicao.model');
var Categoria = require('../models/categoria.model');
var Subcategoria = require('../models/subcategoria.model');
var Video = require('../models/video.model');
var WeLove = require('../models/welove.model');
var Config = require('../models/config.model');

// var mysql = require('/domain/mysql');
// var hb = require('handlebars');
var mysql = require('../domain/mysql');

var sha1 = require('sha1');

var express = require('express');
var app = express();

var Seeder = require('../models/seeders/_main.seeder');

var _prompt = require('prompt');

exports.seeder = function(req, res, next){

    var desc = '\n ';
    desc += '\n*****************************************';
    desc += '\n* Do you really want to run the Seeder? *';
    desc += '\n*****************************************';
    desc += '\n [yes, no]';
    // user confirmation required!
    _prompt.start();
    // disable prefix message & colors
    _prompt.message = '';
    _prompt.delimiter = '';
    _prompt.colors = false;
    // wait for user confirmation
    _prompt.get({
        properties: {
            
            // setup the dialog
            confirm: {
                // allow yes, no, y, n, YES, NO, Y, N as answer
                pattern: /^(yes|no|y|n)$/gi,
                description: desc,
                message: 'Type yes/no',
                required: true,
                //default: 'no'
            }
        }
    }, function (err, result){
        // transform to lower case
        var c = result.confirm.toLowerCase();
        
        // yes or y typed ? otherwise abort
        if (c!='y' && c!='yes'){
            console.log(' ****************** \n * Action Aborted * \n ******************');
            return;
        }
        
        // your code
        sendSeed();
        console.log(' ******************** \n * Action confirmed * \n ********************');
        
    });

    function sendSeed()
    {
        var seeder = new Seeder();
    
        async.waterfall(
            [
                function(callback, socket, data)
                {
                    callback(null, socket, data);
                },

                //authors,
                articles,

                function end(socket, data, callback){
                    callback(null, data);
                }
            ],
            function(err, result)
            {
                return res.render('teste');
            }
        )

        function authors(socket, data, callback)
        {
            seeder
            .generate(10)
            .authors()
            .insert(function(rows){
                callback(null, socket, rows);
            });
        }

        function articles(socket, data, callback)
        {
            async.waterfall
            (
                [
                    function(callback2, socket2, data2)
                    {
                        callback2(null, socket2, data2);
                    },

                    seeder.generate(20).articles,
                ],
                function(err, result){
                    result.insert(function(rows){
                        callback(null, socket, result);
                    });
                }
            )
        }
    }
}

exports.home = function(req, res, next) {

    var negocios_id = null;
    var life_style_id = null;

    var edicoes_ids = null;

    async.series({
        edicoes_ids: function(cb) {
            Edicao.find({})
                .sort('-numero')
                .skip(1)
                .limit(3)
                .exec(function(err, result) {
                    if (err) { return next(err); }
                    edicoes_ids = result;
                    cb(null);
                })
        },

        mainSlider: function(cb){

                FinalObj = {};

                async.waterfall([
                    //Verificar qual é a última edição
                    function(cb2) {
                        Edicao.findOne({})
                            .sort('-numero')
                            .exec(function(err, edicaoAtual) {
                                if (err) { return cb(err); }
                                FinalObj['edicaoAtual'] = edicaoAtual;
                                cb2(null);
                            })
                    },

                    //Encontrar categoria DESTINOS
                    function (cb2){
                        Categoria.findOne({ 'slug': 'destinos' })
                            .exec(function(err, categ){
                                FinalObj['destinos_id'] = categ._id;
                                cb2(null);
                            })
                    },
                    
                    //Pegar a matéria de capa da ultima edição, se existir.
                    function(cb2) {
                        id_edicao = FinalObj.edicaoAtual._id;

                        Materia.findOne({ 'edicao' : id_edicao, 'subcategoria' : '58a5eab84f533c41dad42be4' })
                            .populate(['categoria','subcategoria'])
                            .select({'conteudo': false, 'info_conteudo': false})
                            .sort('created_at')
                            .exec(function(err, materia) {
                                if (err) { return cb(err); }

                                if (materia) {
                                    FinalObj['capa'] = materia; 
                                }

                                cb2(null);
                            })
                    },

                    //Se não houver matéria de capa da ultima edição, pegar a capa mais recente.
                    function(cb2){
                        // console.log(FinalObj);
                        if (!FinalObj.capa) {
                            Materia.findOne({ 'subcategoria' : '58a5eab84f533c41dad42be4' })
                                .populate(['categoria','subcategoria'])
                                .select({'conteudo': false, 'info_conteudo': false})
                                .sort('created_at')
                                .exec(function(err, materia) {
                                    if (err) { return cb(err); }
                                    FinalObj['capa'] = materia;
                                    cb2(null);
                                })
                        //se houver, continua normalmente...
                        }else{
                            cb2(null);
                        }
                    },

                    //Encontrar matérias de destinos
                    function (cb2){
                        Materia.find({ 'categoria': FinalObj.destinos_id })
                            .populate(['categoria','subcategoria'])
                            .select({'conteudo': false, 'info_conteudo': false})
                            .sort('created_at')
                            .limit(2)
                            .exec(function(err, destinos){
                                if (err) { return cb(err); }
                                FinalObj['destinos'] = destinos;
                                cb2(null);
                            })
                    },
                ], function(err) {
                    
                    if (err) {
                        return cb(err);
                    }

                    // console.log('fo::', FinalObj);
                    var obj = {
                        0: FinalObj.capa,
                        1: FinalObj.destinos[0],
                        2: FinalObj.destinos[1]
                    }

                    FinalObj = obj;
                    // console.log(obj);
                    cb(null);
                })
        },

        negocios: function(cb) {
            // console.log('current::', FinalObj); 
            Categoria.findOne({slug: "negocios"})
                .limit(4)
                .populate('subcategorias')
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    negocios_id = result._id;
                    cb(null, result);
                });
        },
        negocios_materias: function(cb) {
            //console.log("negocios_id", negocios_id);
            Materia.find({categoria: negocios_id})
                .populate(['categoria','subcategoria'])
                .sort('-created_at')
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    cb(null, result);
                });
        },
        life_style: function(cb) {
            Categoria.findOne({slug: "life-style"})
                .limit(5)
                .populate('subcategorias')
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    life_style_id = result._id;
                    cb(null, result);
                });
        },
        life_style_materias: function(cb) {
            //console.log("life_style_id", life_style_id);
            Materia.find({categoria: life_style_id})
                .populate(['categoria','subcategoria'])
                .sort('-created_at')
                .limit(2)
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    cb(null, result);
                });
        },
        guia_de_entretenimento: function(cb) {
            Materia.find({categoria: '58ab73fb1413ce267e4d3172'})
                .populate(['categoria','subcategoria'])
                .sort('-created_at')
                .limit(8)
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    cb(null, result);
                });
        },
        videos: function(cb) {
            Video.find()
                .sort('ordem')
                .limit(5)
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    cb(null, result);
                });
        },
        welove: function(cb) {
            WeLove.find({'status':'aprovado'})
                .sort('created_at')
                .limit(8)
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    cb(null, result);
                });
        },
        social: function(cb) {
            Config.find({key: /^social/})
                .limit(16)
                .sort('key')
                .exec(function(err, result) {
                    if (err) { return cb(err); }
                    //console.log("result", result);

                    var titulos = {};
                    var imagens = {};

                    for (var i = 0; i < result.length; i ++) {

                        var key = result[i].key;
                        var value = result[i].value;

                        var key_splited = key.split('_')

                        var index = key_splited[0].split('social')[1];

                        if (key_splited[1] == "imagem") {
                            imagens[index] = value;
                        } else {
                            titulos[index] = value;
                        }

                    }

                    cb(null, {titulos: titulos, imagens: imagens});
                });
        }
    }, function(err, results) {
        if (err) { return next(err); }
        categorias = {};
        // results['mainSlider'] = FinalObj;
        // console.log(results);
        // return hb.compile('home');
        return res.render('home', {_categorias: results, mainSlider: FinalObj});
    })


};

exports.quem_somos = function(req, res) {
    return res.render('quem-somos');
};

exports.edicoes = function(req, res) {

    Edicao.find({})
        .sort('-numero')
        .exec(function(err, edicoes) {
            if (err) { return next(err); }
            return res.render('edicoes', {edicoes: edicoes});
        });

};

exports.contato = function(req, res) {
    return res.render('contato');
};
