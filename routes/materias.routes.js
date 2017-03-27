var Categoria = require('../models/categoria.model');
var Subcategoria = require('../models/subcategoria.model');
var Tag = require('../models/tag.model');
var Materia = require('../models/materia.model');

var async = require('async');

exports.porCategoria = function(req, res, next) {

    var categoria_slug = req.params.categoria_slug;

    // console.log("categoria_slug", categoria_slug);

    async.waterfall([
        function(cb) {
            Categoria.findOne({slug: categoria_slug})
                .populate('subcategorias')
                .exec(function(err, categoria) {
                    if (err) { return cb(err); }
                    cb(null, categoria);
                })
        },
        function(categoria, cb) {
            if (!categoria) {
                return next();
            }
            Materia.find({categoria: categoria._id})
                .sort('-created_at')
                .populate(['categoria', 'subcategoria'])
                .exec(function(err, materias) {
                    if (err) { return cb(err); }
                    cb(null, categoria, materias);
                })
        }
    ], function(cb, categoria, materias) {
        // console.log("categoria", categoria);
        return res.render("categoria", {categoria: categoria, materias: materias});
    })


};

exports.porSubcategoria = function(req, res, next) {

    var categoria_slug = req.params.categoria_slug;
    var subcategoria_slug = req.params.subcategoria_slug;

    async.waterfall([
        function(cb) {
            Subcategoria.findOne({slug: subcategoria_slug})
                .exec(function(err, subcategoria) {
                    if (err) { return cb(err); }
                    cb(null, subcategoria);
                })
        },
        function(subcategoria, cb) {
            if (!subcategoria) {
                // console.log("next!");
                return next();
            }
            Materia.find({subcategoria: subcategoria._id})
                .sort('-created_at')
                .populate(['categoria', 'subcategoria'])
                .exec(function(err, materias) {
                    if (err) { return cb(err); }
                    cb(null, subcategoria, materias);
                })
        }
    ], function(cb, subcategoria, materias) {
        return res.render("subcategoria", {subcategoria: subcategoria, materias: materias});
    })


};

exports.porTag = function(req, res, next) {

    var tag_slug = req.params.tag_slug;

    async.waterfall([
        function(cb) {
            Tag.findOne({nome: tag_slug})
                .exec(function(err, tag) {
                    if (err) { return cb(err); }
                    cb(null, tag);
                })
        },
        function(tag, cb) {
            if (!tag) {
                // console.log("Tag not found");
                return next();
            }
            Materia.find({tags: tag._id})
                .populate(['categoria', 'subcategoria'])
                .sort('-available_at')
                .exec(function(err, materias) {
                    if (err) { return cb(err); }
                    cb(null, tag, materias);
                })
        }
    ], function(cb, tag, materias) {
        return res.render("tag", {tag: tag, materias: materias});
    })


};

exports.mostrar = function(req, res, next) 
{

    var slug = req.params.slug;

    var createGlobalGroup = function(socket, data) 
    {
        async.waterfall(
        [
            /**
             * this function is required to pass data recieved from client
             * @param  {Function} callback To pass data recieved from client
             */

            function(callback) {
                callback(null, socket, data);
            },

            findArticle,

            countThisCategory,

            selectRandom,

            add,

        ]
        ,function(err, result) {
            /**
             * function to be called when all functions in async array has been called
             */
            
            //STEP 1 1 1 1 1
            //console.log('project created ....', result)
            return res.render("materia", result );
            // cb(null, b);
        });
    }

    findArticle = function(socket, data, callback) 
    {
        // console.log("find article", asyncObj);
        // return;
        Materia.findOne({slug: slug})
            .populate('categoria')
            .populate('subcategoria')
            .populate('autor')
            .populate('tags')
            .exec(function(err, materia) {

                // asyncObj['materia'] = materia;
                materia.deepPopulate('subcategoria.categoria', function(err, _materia) {
                    if (err) { return next(err); }
                    callback(null, socket, {materia: materia});
                })

            })
    }

    countThisCategory = function(socket, data, callback) {

        
        /**
         * call next function in series
         * provide sufficient input to next function
         */
        Materia.count({ 'subcategoria': data.materia.subcategoria._id })
            .exec(function(err, count){
                data['count'] = count;
                callback(null, socket, data );
            })
    }

    selectRandom = function(socket, data, callback) 
    {
        // console.log('selRandom', asyncObj);
        // return;
        data['rels'] = [];
        var total = 3;
        var i = total;
        while(i > 0)
        {
            //TODO Temos um problema aqui. número randomico não pode repetir, no mysql isso é muito mais fácil, e agora? Trocar???
            //
            var random = Math.floor(Math.random() * data.count)
            // Get a random entry
            //var random = Math.floor(Math.random() * count)

            // Again query all users but only fetch one offset by our random #
            Materia.findOne({ 'subcategoria': data.materia.subcategoria._id }).skip(random)
                .select({'conteudo':false})
                .exec(
                function (err, result) {
                    //console.log('rs:: ',result);
                    data.rels.push(result);

                    if (i == 0) {
                        add( socket, data, data.rels, total, callback );
                    }
                });
            i--;
        }
    };

    add = function( socket, data, asyncObj, total, callback) 
    {
        console.log(asyncObj);
        if (asyncObj.length == total) {
            callback(null, socket, data, { rels: asyncObj}, 'theend' );
        }


        if (total == 'theend') {
//            console.log('FinalTTL::', data);
            callback(null, data );
        }
    };

    createGlobalGroup();
};


exports.porSubcategoriaApi = function(req, res, next) {

    var subcategoria_id = req.params.subcategoria_id;

    var limit = parseInt(req.query.limit);

    Materia.find({subcategoria: subcategoria_id})
        .populate(['categoria', 'subcategoria'])
        .sort('-available_at')
        .limit(limit)
        .exec(function(err, materias) {
            if (err) { return next(err); }
            return res.send({results: materias});
        })

};

exports.porCategoriaApi = function(req, res, next) {

    var categoria_id = req.params.categoria_id;

    var limit = parseInt(req.query.limit);

    Materia.find({categoria: categoria_id})
        .populate(['categoria', 'subcategoria'])
        .sort('-available_at')
        .limit(limit)
        .exec(function(err, materias) {
            if (err) { return next(err); }
            return res.send({results: materias});
        })

};
