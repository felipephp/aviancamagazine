var Model = require('../models/video.model');

var async = require('async');
var path = require('path');
var random = require('../lib/random');
// var uploadFile = require('../lib/upload-file');
var async = require('async');

//Tbm pode deletar depois de gerar SLUGS
var generateSlug = require('../domain/generate-slug');

exports.view = function(req, res, next) {

    Model.find({})
        .sort('-created')
        .exec(function(err, videos) {
            if (err) { return next(err); }

            console.log(videos);

            //função para atualizar SLUGS, pode ser deletada depois de ir para produção
            for( var vid in videos ){
            	var selectedVideo = videos[vid];
            	if (!selectedVideo.slug) {
			        selectedVideo.slug = generateSlug(selectedVideo.nome);
			        selectedVideo.save();
			    }
            }

            var selectedVideo = videos[0];
            //delete(videos[0]);

            return res.render('video', { videos: videos, selectedVideo: selectedVideo });
        });

}

exports.video = function(req, res, next) {

	var slug = req.params.slug;

	async.waterfall([

		function(cb){
			Model.find({ 'slug' : { $ne: slug } })
			.exec(function(err, videos){
				cb(null, videos);
			})
		},

		function(videos, cb){
			Model.findOne({ 'slug' : slug })
		        .exec(function(err, video) {
		            if (err) { return next(err); }

		            if (!video.slug) {
				        video.slug = generateSlug(video.nome);
				        video.save();
				    }

				    cb(null, videos, video);
		        });
		}

		], 
		function(cb, all, selectedVideo){
			return res.render('video', { videos: all, selectedVideo: selectedVideo });
		})

}