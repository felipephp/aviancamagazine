var async = require('async');

var Autor = require('../models/autor.model');
var Materia = require('../models/materia.model');
var Edicao = require('../models/edicao.model');
var Categoria = require('../models/categoria.model');
var Subcategoria = require('../models/subcategoria.model');
var Video = require('../models/video.model');
var WeLove = require('../models/welove.model');
var Config = require('../models/config.model');

// var hb = require('handlebars');
var mysql = require('../domain/mysql-helper/mysql');

var sha1 = require('sha1');

var express = require('express');
var app = express();

var Seeder = require('../models/seeders/_main.seeder');
var querystring = require('querystring');
var _prompt = require('prompt');

exports.migrate = function(req, res, next){
    async.waterfall(
        [
            function(callback, socket, data)
            {
                data = {};
                callback(null, socket, data);
            },

            //readCateg, OK
            //readArticles,
            //readEditions, //OK
            //readAuthors,
            //readSubcat, ok
            updateArticlesFK,
            convert,
            confirmExport

            // migrateArticles
        ],
        function(err, result)
        {
            //console.log('\n\n ======================= Enviar para isnertMany');
            //console.log('result::',result);
            mysql.insertMany( { table: result.table, data: result.mysqlData }, function(rows){
                console.log('\n\n *********** Ok, inserted');
            });
        }
    )

    function readCateg(socket, data, callback){
        Categoria.find({})
            .exec(function(err, result){
                if (err) { return next(err); }
                // console.log(result);

                cols = {
                    _id: 'old_id',
                    slug: 'slug',
                    nome: 'name',
                    fixed_menu: 'fixed',
                    ordem: 'position',
                    created_at: 'created_at'
                }


                data.controllers = {
                    fixed: function(value){
                        if (!value) {
                            value = 0;
                        }

                        return value;
                    },

                    position: function(value){
                        if (!value) {
                            value = 0;
                        }

                        return value;
                    },

                    old_id: function(value){
                        return "'"+value+"'";
                    }
                }

                data.table = 'categories';
                data.cols   = cols;
                data.found  = result;

                callback(null, socket, data);
            })
    }

    function readArticles(socket, data, callback){
        //var sub_id = 'Here';

        Materia.find({})
            .sort({'created_at': 1})
            .populate(['subcategoria','autor','edicao'])
            .exec(function(err, result){
                if (err) { return next(err); }
                console.log('res::', result);

                cols = {
                    "_id"                   : 'old_id',
                    "subcategoria"          : 'old_cat_id',
                    "autor"                 : 'old_aut_id',
                    "edicao"                : 'old_edi_id',
                    "slug"                  : 'slug',
                    "imagem_principal_path" : 'main_img_path',
                    "imagem_chamada_path"   : 'headline_img_path',
                    "titulo"                : 'title',
                    "titulo_chamada"        : 'headline_title',
                    "conteudo_chamada"      : 'headline_content',
                    "available_at"          : 'available_at',
                    "conteudo"              : 'content',
                    "created_at"            : 'created_at',
                    // "tags"                  : 'tags',
                }


                data.controllers = {

                    old_id: function(value){
                        return "'"+value+"'";
                    },

                    old_cat_id: function(value){
                        return "'"+value._id+"'";
                    },

                    old_aut_id: function(value){
                        if (value == undefined) {
                            //avianca em revista
                            return '58a2fe0375a20b763a07366d';
                        }else{
                            return "'"+value._id+"'";
                        }
                    },
                    old_edi_id: function(value){
                        return "'"+value._id+"'";
                    },
                }

                data.table = 'articles';
                data.cols   = cols;
                data.found  = result;

                callback(null, socket, data);
            })
    }

    function readEditions(socket, data, callback){
        Edicao.find({})
            .exec(function(err, result){
                if (err) { return next(err); }
                // console.log(result);

                cols = {
                    _id: 'old_id',
                    'capa_path': 'img_path',
                    'numero': 'number',
                    'titulo': 'title',
                    'link_online': 'link',
                    'created_at': 'created_at'
                }


                data.controllers = {
                    old_id: function(value){
                        return "'"+value+"'";
                    }
                }

                data.table = 'editions';
                data.cols   = cols;
                data.found  = result;

                callback(null, socket, data);
            })
    }

    function readAuthors(socket, data, callback)
    {
        Autor.find({})
        .exec(function(err, result){
            if (err) { return next(err); }
            // console.log(result);

            cols = {
                _id: 'old_id',
                'nome': 'name',
                'cargo': 'position',
                'mini_cv': 'short_resume',
                'created_at': 'created_at'
            }


            data.controllers = {
                old_id: function(value){
                    return "'"+value+"'";
                }
            }

            data.table = 'authors';
            data.cols   = cols;
            data.found  = result;

            callback(null, socket, data);
        })
    }

    function readSubcat(socket, data, callback){
        Subcategoria.find({ 'categoria' : '58d5778bca66604b76f992f6' })
            .exec(function(err, result){
                if (err) { return next(err); }
                // console.log(result);

                cols = {
                    _id: 'old_id',
                    'slug': 'slug',
                    'nome': 'name',
                    'categoria': 'categories_id',
                    'created_at': 'created_at'
                }

                data.controllers = {
                    old_id: function(value){
                        return "'"+value+"'";
                    },

                    categories_id: function(value){
                        var real_id = 0;
                        //value = "'"+value+"'";

                        var V = value.toString();
                        //console.log('currval::', value);
                        
                        switch(V)
                        {
                            case '589bbddcd469b56893cfc27b':
                                real_id = 1;
                                break;

                            case '589bbe420551da698b474c05':
                                real_id = 2;
                                break;

                            case '589bbdfeebbd1068f49c0611':
                                real_id = 3;
                                break;

                            case '589bbe4c01c0ae69d1a0c181':
                                real_id = 4;
                                break;

                            case '58ab73fb1413ce267e4d3172':
                                real_id = 5;
                                break;

                            case '58d03619a7692b27f8c868d3': //categoria perdida
                                real_id = 6;
                                break;

                            case '58d5676efe4d0945a268bbd2': //categoria perdida
                                real_id = 7;
                                break;

                            case '58a5a8b24f533c41dad42baf':
                                real_id = 8;
                                break;

                            case '58d5778bca66604b76f992f6': //categoria perdida
                                real_id = 9;
                                break;
                        }

                        return real_id;
                    }
                }

                data.table  = 'categories';
                data.cols   = cols;
                data.found  = result;

                callback(null, socket, data);
            })
    }

    function updateArticlesFK(socket, data, callback){
        async.waterfall(
            [
                function(callback2) {
                    callback2(null, socket, data);
                },

                //getCategories,
                //getAuthors,
                getEdtitions,
            ],
            function(err2, finalResult)
            {

            }
        )

        function getCategories(socket2, data2, callback2) {

            console.log('\n **************************************** \n * categories have already been updated * \n ****************************************');
            callback2(null, socket2, data2);
            return false;

            mysql._devQuery('SELECT id, old_id FROM categories WHERE categories_id IS NOT NULL', function(subcats){
                
                for(var idx in subcats)
                {
                    var scat = subcats[idx];
                    //console.log('old found::', scat.old_id);
                    mysql.query.update = true;
                    mysql.query.arrayValues = [scat.id, scat.old_id];
                    mysql.query("UPDATE articles SET categories_id = ? WHERE old_cat_id = ?", function(){
                        //console.log('\n\nupdated...');
                    })
                }

            });

        }

        function getAuthors(socket2, data2, callback2) {

            console.log('\n ************************************* \n * authors have already been updated * \n *************************************');
            callback2(null, socket2, data2);
            return false;

            mysql._devQuery('SELECT id, old_id FROM authors', function(authors){
                
                for(var idx in authors)
                {
                    var scat = authors[idx];
                    //console.log('old found::', scat.old_id);
                    mysql.query.update = true;
                    mysql.query.arrayValues = [scat.id, scat.old_id];
                    mysql.query("UPDATE articles SET authors_id = ? WHERE old_aut_id = ?", function(){
                        //console.log('\n\nupdated...');
                    })
                }

            });
        }

        function getEdtitions(socket2, data2, callback2) {

            // console.log('\n ************************************** \n * editions have already been updated * \n **************************************');
            // callback2(null, socket2, data2);
            // return false;

            mysql._devQuery('SELECT id, old_id FROM editions', function(editions){
                
                for(var idx in editions)
                {
                    var scat = editions[idx];
                    //console.log('old found::', scat.old_id);
                    mysql.query.update = true;
                    mysql.query.arrayValues = [scat.id, scat.old_id];
                    mysql.query("UPDATE articles SET editions_id = ? WHERE old_edi_id = ?", function(){
                        //console.log('\n\nupdated...');
                    })
                }

            });
        }
    }

    function convert(socket, data, callback){

        var converted = [];
        var found = data.found;
        var cols = data.cols;

        for(var idx in found)
        {
            var obj = {};
            var cat = found[idx];

            //console.log('\ncat '+idx+'\n');
            for(var attr_i in cols)
            {
                var col = cols[attr_i];

                //console.log('col '+attr_i+' da categoria é: '+cat[attr_i]+' e a coluna no mysql será: '+col);

                //var value = ( !cat[attr_i] ) ? null : cat[attr_i];
                var value;
                if ( typeof data.controllers[col] == 'function' ) {
                    //Example: fixed(colValue)
                    value = data.controllers[col](cat[attr_i]);
                }else{
                    //Just assign and continue...
                    value = cat[attr_i];
                }

                obj[col] = value;
            }

            //console.log('mysql converted: ', obj);
            converted.push(obj);
        }

        data.mysqlData = converted;

        callback(null, socket, data);
    }

    function migrateArticles(socket, data, callback){

    }

    function confirmExport(socket, data, callback){
        var desc = '\n ';
        desc += '\n******************************';
        desc += '\n* EXPORTAR DADOS PARA MYSQL? *';
        desc += '\n******************************';
        desc += '\n [yes, no]';


        //console.log('DATA::', data);
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
                    default: 'no'
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
            //sendSeed();
            callback(null, data);
            console.log(' ******************** \n * Action confirmed * \n ********************');
            
        });
    }
}

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
    var slider = {};
    async.series({

        slider: function(cb){

            async.waterfall(
                [
                    function(callback, socket, data) {
                        callback(null, socket, data);
                    },

                    getLastCover,
                    getLastDestinations,
                ], 
                function(err, socket, finalResult)
                {
                    cb();
                }
            );

            function getLastCover(socket, data, callback){
                mysql.select('articles', ['main_img_path', 'title', 'slug'])
                    .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS subcategoria'] })
                    .join({ table: 'categories', on: 'id', key: 'B.categories_id', columns: ['name AS categoria'] })
                    .where({
                        categories_id: { o: '=', v: '35', alias: 'A' }
                    })
                    .orderBy('A.editions_id DESC')
                    .limit(1)
                    .exec(function (rows) {
                        //console.log("R@::", rows);
                        slider[0] = rows[0];
                        callback(null, socket, data);
                    });
            }

            function getLastDestinations(socket, data, callback){
                mysql.select('articles', ['main_img_path', 'title', 'slug'])
                    .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS subcategoria'] })
                    .join({ table: 'categories', on: 'id', key: 'B.categories_id', columns: ['name AS categoria'] })
                    .where({
                        categories_id: { o: '=', v: '10', alias: 'A' },
                        besides: 'OR',
                        categories_id2: { alias: 'A', column: 'categories_id', o: '=', v: '11' }
                    })
                    .orderBy('A.editions_id DESC')
                    .limit(2)
                    .exec(function (rows) {
                        slider[1] = rows[0];
                        slider[2] = rows[1];
                        callback(null, socket, data);
                    });
            }
        },

        agendaCultural: function (cb)
        {
            mysql.select('articles')
                .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS subcategoria'] })
                .join({ table: 'categories', on: 'id', key: 'B.categories_id', columns: ['name AS categoria'] })
                .where({ id: { alias: 'C',  o: '=', v: '2' } })
                .orderBy('A.available_at')
                .limit('3')
                .exec(function (rows) {
                    cb(null, rows);
                })
        },

        lastArticles: function (cb) {
            mysql.select('articles', ['id', 'title', 'slug'])
                .limit(12)
                .orderBy('available_at')
                .exec(function (rows) {
                    cb(null, rows);
                })
        },

        negociosSub: function (cb) {
            mysql.select('categories')
                .where({ categories_id: { o: '=', v: '4' } })
                .exec(function (rows) {
                    cb(null, rows);
                })
        },

        lifeStyleSub: function (cb) {
            mysql.select('categories')
                .where({ categories_id: { o: '=', v: '3' } })
                .exec(function (rows) {
                    cb(null, rows);
                })
        },

        guia: function (cb) {
            //TODO - Entertianemnt will be a different table
            mysql.select('articles')
                .where({ id: { alias: 'C',  o: '=', v: '5' } })
                .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS subcategoria'] })
                .join({ table: 'categories', on: 'id', key: 'B.categories_id', columns: ['name AS categoria'] })
                .orderBy('A.available_at')
                .exec(function (rows) {
                    //console.log("Guide:: ", rows);
                    cb(null, rows);
                })
        },

        videos: function(cb) {
            mysql.select('videos')
                .orderBy('created_at')
                .limit('5')
                .exec(function (rows) {
                    cb(null, rows);
                });
        },
        welove: function(cb) {
            mysql.select('welove')
                .where({ status: { o: '=', v: '1' } })
                .orderBy('created_at')
                .limit('8')
                .exec(function (rows) {
                    var a1 = [];
                    var a2 = [];

                    var m = 0;
                    var i = 0;
                    while(i < 8)
                    {
                        if (i <= 3)
                        {
                            a1.push(rows[i]);
                        }else
                        {
                            a2.push(rows[i]);
                        }

                        i++;
                    }

                    cb(null, [ a1, a2 ] );
                })
        },

        social: function (cb) {
            mysql.select('social')
                .orderBy('editions_id')
                .limit('8')
                .exec(function (rows) {
                    cb(null, rows);
                })
        },
    }, function(err, results) {
        if (err) { return next(err); }
        return res.render('home', {_categorias: results, mainSlider: slider});
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

exports.anuncie = function(req, res) {
    return res.render('anuncie', { data: {} });
};

exports.avianca = function(req, res) {
    return res.render('avianca');
};
