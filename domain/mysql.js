var MySQLExt = require('mysql');

module.exports = {

    host: "127.0.0.1",
    user: "root",
    password: "elipse",
    database: "node_avianca",
    connection: null,
    query: null,
    stored: {}, //objeto de queries armazenado para pegar psoterior a um laoço, caso não haja callback

    createConnection: function()
    {
        this.connection = MySQLExt.createConnection({
          host: "127.0.0.1",
          user: "root",
          password: "elipse",
          database: "node_avianca"
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
        
        var fn = this.connection.query(queryString, function(err, result){
            if(err) throw err;
            callback(result);
        });

        
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

        for(col in data)
        {
            if (!cols) 
            { 
                cols    = col; 
                values  = '"'+data[col]+'"';
            }
            else 
            { 
                cols += ', '+col; 
                values += ', "'+data[col]+'"';
            }
        }

        this.query.insert = "INSERT INTO "+table+" ("+cols+") value("+values+")";
        return this;
    },

    select: function(table, columns)
    {
        this.__reset();

        if (columns == undefined) { columns = '*'; }

        this.query.select = {
          table: table,
          columns: columns
        }

        //this.query = 'SELECT '+columns+' FROM '+table;
        return this;
    },

    join: function(data)
    {
        if (!data.type) { data.type = 'inner'; }

        //console.log('TODO:: Criar validação de json do atributo "data" obrigatório para join\n');

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

        if (this.query.order != undefined) {
            throw new Error('WHERE goes before order. Please, follow the correct SQL sequence,');
        }

        this.query.where = where;

        return this;
    },

    order: function(order){
        //TODO
        this.query.order = order;

        return this;
    },

    //Setup alfabetic alias from number (array position)
    __setAlias: function(n){
        //97 é para lower case, para upper case é 65
        return String.fromCharCode(n+65);
    },

    //Find table alias from table name
    __findTableAlias: function(table){
        var $this = this;
        var tableName = table.name;
        var found = false;

        //First find in main table (SELECT) 
        (function(){
            if (tableName == $this.query.select.table) {
                found = $this.query.select.alias;
                //console.log('Table: "'+tableName+'" has found in select object, and your alias is: "'+found+'"');
            }
        })();

        if (found) {
            return found;
        }

        //If table wasnt the main table, continue search in join tables.
        (function(){
            for (var idx in $this.query.joins) {
                var curr = $this.query.joins[idx];

                if (curr.table.name == tableName) {
                    found = curr.alias;
                    //console.log('[JOIN] Table: "'+tableName+'" has found in JOIN object, and your alias is: "'+found+'"');
                }
            }
        })();

        if(found)  { return found } else { throw new Error('The alias from ('+tableName+') cannot be found') };
    },

    //Build query from complete object
    exec: function(callback)
    {
        var $this = this;
        //Create join query from object
        function join(data)
        {
            // obj = { 
            //     type: 'inner', 
            //     table: { name: 'edition', col: 'id' },
            //     f_table: { name: 'social', col: 'editions_id' }
            // }

            var type            = data.type;
            var table           = data.table;

            var f_tableAlias    = $this.__findTableAlias(data.f_table);
            var f_table         = $this.__findTableAlias(data.f_table);

            return type+' join '+table.name+' as '+data.alias+' on '+data.alias+'.'+table.col+' = '+f_tableAlias+'.'+f_table.col;
        }

        function select()
        {
            var str = '';
            this.query = 'SELECT '+columns+' FROM '+table;
        }

        if (this.query.insert) 
        {
            $this.query(this.query.insert, callback);
        }
        if (this.query.joins != null) 
        {
            var objteste = this.query.joins[0];
            console.log(this.query.joins);
            var t = join(objteste);
        }

        if (this.query.select)
        {

        }

        this.__reset();
    },

    //Reset query object
    __reset: function()
    {
        this.query.select   = null;
        this.query.joins    = null;
        this.query.where    = null;
        this.query.order    = null;
    }
}