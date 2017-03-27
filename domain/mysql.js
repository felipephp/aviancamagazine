var MySQLExt = require('mysql');
var config = require('../config');

module.exports = {

    connection: null,
    query: null,
    stored: {}, //objeto de queries armazenado para pegar psoterior a um laoço, caso não haja callback

    createConnection: function()
    {
        this.connection = MySQLExt.createConnection({
          host: config.mysql.host,
          user: config.mysql.user,
          password: config.mysql.password,
          database: config.mysql.database
        });
    },

    connect: function()
    {
        this.createConnection();

        this.connection.connect(function(err){
          if(err){
            console.log('Error connecting to DB.', err);
            return;
          }
          //console.log('Connection established');
        });     
    },

    end: function()
    {
        this.connection.end();
        //console.log('connection ended.');
    },

    query: function(queryString, callback)
    {    
        if (typeof callback != 'function') {
            throw new Error('All Queries needs a callback function');
        }

        var $this = this;

        this.connect();
        
        if (this.query.insert || this.query.update) {
            //console.log(this.query.arrayValues);
            console.log('\n\n::querystring', queryString);
            var fn = this.connection.query(queryString, this.query.arrayValues, function(err, result){
                if(err) throw err;
                callback(result);
            });

        }
        else{
            var fn = this.connection.query(queryString, function(err, result){
                if(err) throw err;
                callback(result);
            });
        }

        
        this.end();

        if (typeof callback != 'function') {
            return this;
        }

    },

    insertMany: function(cfg)
    {
        var all = [];

        for(var idx in cfg.data)
        {
            var reg = cfg.data[idx];

            if (idx == (cfg.data.length-1) ) {
                currCallback = onEnd;
            }else{
                currCallback = once;
            }

            this.insert(cfg.table, reg).exec(currCallback);
        }

        function once(row){
            //console.log('\n once::', row);
            all.push(row);
        }

        function onEnd(row){
            all.push(row); //push the last row
            cfg.onEnd(all);
        }
    },

    insert: function(table, data)
    {
        if ( data instanceof Array ) {
            throw new Error('This function only accept objects and insert only one record at a time. If you want to insert many records, please, use insertMany() function');
        }

        this.__reset();

        var cols = false;
        var values = '';
        var arrayValues = [];

        for(col in data)
        {
            if (!cols) 
            { 
                cols    = col; 
                // values  = '"'+data[col]+'"';
                values = '?';
            }
            else 
            { 
                cols += ', '+col; 
                //values += ', "'+data[col]+'"';
                values += ', ?';
            }

            arrayValues.push(data[col]);
        }

        this.query.arrayValues = arrayValues;
        this.query.insert = "INSERT INTO "+table+" ("+cols+") values("+ values +")";

        // console.log(  this.query.arrayValues );
        return this;
    },

    select: function(table, columns)
    {
        this.__reset();

        if (columns == undefined) { columns = '*'; }

        this.query.select = {
          table: table,
          columns: columns
        };

        return this;
    },

    join: function(data)
    {
        if (!data.type) { data.type = 'INNER'; }
        data.type += ' JOIN';

        if (this.query.select == null) {
            throw new Error('This function requires this.select() first. Please, follow the correct SQL sequence, ');
        }

        if (this.query.joins == undefined) {
            data.alias = 'B';
            this.query.joins = [data];
            this.query.select.alias = 'A';
        }else{
            //console.log('LENG::', this.query.joins.length);
            data.alias = this.__setAlias(this.query.joins.length+1);
            this.query.joins.push(data);
        }

        for(j in this.query.joins){
            var f = this.query.joins[j];
        }

        return this;
    },

    where: function(where){
        if (this.query.select == undefined) {
            throw new Error('First [select, joins...] then where. Please, follow the correct SQL sequence,');
        }

        this.query.where = 'WHERE '+where;

        return this;
    },

    orderBy: function(orderBy){
        if (this.query.select == undefined) {
            throw new Error('First [select, joins...] then where. Please, follow the correct SQL sequence.');
        }

        this.query.orderBy = 'ORDER BY '+orderBy;

        return this;
    },

    limit: function(limit){
        if (this.query.select == undefined) {
            throw new Error('First [select, joins...] then where. Please, follow the correct SQL sequence.');
        }

        this.query.limit = 'LIMIT '+limit;

        return this;
    },

    //Setup alfabetic alias from number (array position)
    __setAlias: function(n){
        //97 é para lower case, para upper case é 65
        return String.fromCharCode(n+65);
    },

    /*
    * Only for developer. Just get builded query to analyse.
    * */
    _get: function () {
        return this.exec(null, false);
    },

    //Build query from complete object
    exec: function(callback, exec)
    {
        if ( exec == undefined ) {
            exec = true;
        }

        var QUERY_STRING = '';
        var $this = this;
        //Create join query from object
        function join(data)
        {
            var JOIN            = data.type;
            var table           = data.table;

            return JOIN+' '+table+' AS '+data.alias+' ON '+data.alias+'.'+data.on+' = '+data.key;
        }

        if (this.query.insert || this.query.update)
        {
            $this.query(this.query.insert, callback);
        }
        else if(this.query.delete)
        {

        }
        else if(this.query.joins || this.query.select)
        {
            if (this.query.select)
            {
                if (this.query.select.alias != undefined) {
                    this.query.select.table = this.query.select.table +' AS '+this.query.select.alias;
                }

                this.__buildCols(this.query.select.columns, this.query.select.alias);
                QUERY_STRING = 'SELECT {{cols}} FROM '+this.query.select.table;
            }

            if (this.query.joins != null)
            {
                var QUERY_JOIN = null;
                for(var idx in this.query.joins)
                {

                    var i_join = this.query.joins[idx];
                    this.__buildCols(i_join.columns, i_join.alias);
                    ( !QUERY_JOIN ) ? QUERY_JOIN = join(i_join) : QUERY_JOIN += ' '+join(i_join);
                }

                QUERY_STRING += ' '+QUERY_JOIN;
            }
        }
        else
        {
            throw new Error("There isn't query to build");
        }

        if (this.query.where) {
            QUERY_STRING += ' '+this.query.where;
        }

        if (this.query.orderBy) {
            QUERY_STRING += ' '+this.query.orderBy;
        }
        QUERY_STRING = QUERY_STRING.replace('{{cols}}', this.query.cols);

        console.log('\n ***********************');
        console.log(QUERY_STRING);
        console.log('\n ***********************');

        if (!exec) {
            return QUERY_STRING;
        }else{
            this.query(QUERY_STRING, callback);
        }

        this.__reset();
    },

    __buildCols: function(str, alias){
        if (!alias) {
            alias = '';
        }else{
            alias += '.';
        }

        var arr = str.split(',');
        for(var idx in arr){
            var col = arr[idx];

            //Se for string de função como count, sum e etc, ignorar alias.
            var finalCol;
            if ( col.search('\\(') < 0 ) {
                finalCol = alias+col;
            }else{
                finalCol = col;
            }

            if(!this.query.cols){
                this.query.cols = finalCol;
            }else{
                this.query.cols += ', '+finalCol;
            }
        }
    },

    //Reset query object
    __reset: function()
    {
        this.query.select   = null;
        this.query.joins    = null;
        this.query.where    = null;
        this.query.orderBy  = null;
        this.query.cols  = null;
    }
}