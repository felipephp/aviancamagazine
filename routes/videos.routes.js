var Model = require('../models/video.model');

var path = require('path');
var random = require('../lib/random');
// var uploadFile = require('../lib/upload-file');
var async = require('async');

//Tbm pode deletar depois de gerar SLUGS
var generateSlug = require('../domain/generate-slug');
var mysql = require('../domain/mysql-helper/mysql');

exports.view = function(req, res, next) {

	mysql.select('videos')
		.orderBy('created_at')
		.exec(function (rows) {
			var selected = false;
            var slug = req.params.slug;

            for(var idx in rows){
            	var vid = rows[idx];
                if (vid.slug == slug) {
                	selected = idx;
                }
			}

            if (!selected) {
            	selected = 0;
            }

			var s = rows[selected];

            return res.render('video', { videos: rows, selectedVideo: s });
        });
};