/**
 * TODO LIST
 * - Separate mysql.js and main.seeder correctly before publish on github
 * - add generateSlug como parte do projeto??? não, faker ja tem isso. mas pensar em add faker como dependencia
 * - Publish it in github [models/seeders/_main.seeder [this], domain/mysql.js]
 * - Create categories seeder from production DB, before the articles seeder
 */

var mysql 	= require('../../domain/mysql');
// var extend 	= require('util')._extend;

var articles 	= require('./articles.seeder');
var authors 	= require('./authors.seeder');
var async 		= require('async');

module.exports = function(){
	var $this = this;

	this.qtt = 1;
	this.reg = [],

	/**
	 * Do it to protect the object {reg} for direct editions
	 */
	this._store = function(data, action){

		if (!data) {
			throw new Error('data needs to be an object or string for action.');
		}

		if (typeof data == 'string') {
			action = data;
		}

		if (action == 'get') 
		{
			return this.reg;
		}
		else
		{
			this.reg = data;
			return $this;
		}
	},

	this._reset = function()
	{
		$this.reg = [];
		$this.qtt = 1;
	}

	/**
	 * Set quantity fakes the next function will be generate. Defualt is '1'
	 * @param  {[type]} qtt [description]
	 * @return {[type]}     [description]
	 */
	this.generate = function(qtt){
		$this.qtt = qtt;
		return $this;
	}

	/**
	 * Only return the generated fakes
	 * @return {[Array]} [Array with all generated fakes]
	 */
	this.get = function(){
		return $this._store('get');
		$this._reset();
	}

	/**
	 * insert generated fakes into database
	 * @return {[type]} [description]
	 */
	this.insert = function(callback){
		var fakes = $this.get();
		console.log('currFakes::', fakes);

		mysql.insertMany({
			table: this.currTableQuery,
			data: fakes,
			onEnd: function(rows){
				callback(rows);
			}
		});

		$this._reset();
	}

	this.authors = function(){
		this.currTableQuery = 'authors';
		var obj = authors.seed(this.qtt);
		$this._store(obj);
		return $this;
	}

	this.articles = function(socket, data, cb){
		this.currTableQuery = 'articles';

			async.waterfall(
				[
					function(callback, socket, data)
					{
						$this.currTableQuery = 'articles';
						data = {};
						callback(null, socket, data);
					},

					//getCategories,
					function(socket, data, callback)
					{
						mysql.query('SELECT MAX(id) as max, MIN(id) as min FROM categories', function(rows){
				            data.categories = rows[0];
				            callback(null, socket, data);
				        });
					},
					//getEditions,
					function(socket, data, callback)
					{
						mysql.query('SELECT MAX(id) as max, MIN(id) as min FROM editions', function(rows){
				            data.editions = rows[0];
				            callback(null, socket, data);
				        });			
					},
					// getAuthors,
					function(socket, data, callback){
						mysql.query('SELECT MAX(id) as max, MIN(id) as min FROM authors', function(rows){
				            data.authors = rows[0];
				            callback(null, socket, data);
				        });
					},
					// generateFakes,
					function(socket, data, callback){
						var obj = articles.seed($this.qtt, data);
						$this._store(obj);
						callback(null, data);
					}
					
				],
				function(err, result, callback)
				{
					cb(null, $this);
				}
			)

		getCategories = function(socket, data, callback)
		{
			mysql.query('SELECT MAX(id) as max, MIN(id) as min FROM categories', function(rows){
	            data.categories = rows[0];
	            callback(null, socket, data);
	        });
		}

		getEditions = function(socket, data, callback)
		{
			mysql.query('SELECT MAX(id) as max, MIN(id) as min FROM editions', function(rows){
	            data.editions = rows[0];
	            callback(null, socket, data);
	        });			
		}

		getAuthors = function(socket, data, callback){
			mysql.query('SELECT MAX(id) as max, MIN(id) as min FROM authors', function(rows){
	            data.authors = rows[0];
	            callback(null, socket, data);
	        });
		}

		generateFakes = function(socket, data, callback){
			//console.log('DATA::', data);
			var obj = articles.seed($this.qtt, data);
			//console.log('OBJ::', obj);
			$this._store(obj);
			callback(null, socket, data);
		}
	}
}