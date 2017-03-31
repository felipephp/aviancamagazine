var mysql = require('../domain/mysql-helper/mysql');
var myHelper = require('../lib/articles_helper');

module.exports = {
    aliasToGet: null,

    /*
    * Get articles with cat and sub cat info.
    * */
    getArticle: function (from_id, cutSentence, callback) {
        var ALIAS = this.aliasToGet;

        if (typeof cutSentence == 'function') {
            callback = cutSentence;
            cutSentence = false;
        }

        mysql.select('articles')
            .join({ table: 'categories', on: 'id', key: 'A.categories_id', columns: ['name AS subcategoria', 'slug AS sub_slug'] })
            .join({ table: 'categories', on: 'id', key: 'B.categories_id', columns: ['name AS categoria', 'slug AS cat_slug'] })
            .where({ id: { alias: ALIAS,  o: '=', v: from_id } })
            .orderBy('A.available_at')
            .exec(function (rows) {
                for(var idx in rows)
                {
                    myHelper.getShowInfo(rows[idx], cutSentence);
                }

                callback(rows);
            })
    },

    from: function (f) {
        switch (f)
        {
            case 'category':
                this.aliasToGet = 'C';
                break;

            case 'subcategory':
                this.aliasToGet = 'B';
                break;

            case 'articles':
                this.aliasToGet = 'A';
                break;
        }

        return this;
    }
};