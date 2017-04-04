var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var session = require('express-session');
var session = require('cookie-session');
var mongoose = require('mongoose');
var flash = require('./lib/flash');
var validate = require('./lib/validate');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var mailgun = require('./lib/mailgun');
var favicon = require('serve-favicon');
var autoIncrement = require('mongoose-auto-increment');
var log = require('./lib/my-log');
var request = require('request');
var async = require('async');
var qt = require('quickthumb');
var i18n = require('i18n');
var moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
var config = require('./config');

var app = express();

var mysql = require('./domain/mysql-helper/mysql');

var Categoria = require('./models/categoria.model');
var SubCategoria = require('./models/subcategoria.model');
var Tag = require('./models/tag.model');
var Edicao = require('./models/edicao.model');
var Materia = require('./models/materia.model');
var Config = require('./models/config.model');

var articlesHelper = require('./lib/articles_helper');

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser('PSOAI0912iudsaoiu0219'));
app.use(session({
    name: 'session',
    keys: ['dosiau1093278asdiy', 'poiud089273fasuy']
}));

app.use(mailgun.initialize(app, config.mailgun));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//app.use(express.static('public'));
var root_path = path.dirname(require.main.filename);
var public_path = path.join(root_path, 'public');
app.use(qt.static(public_path));


app.use(expressValidator({
    customValidators: {

    }
}));
app.use(log());
app.use(favicon('./public/assets/img/favicon.png'));

app.set('views', './views');
app.set('view engine', 'pug');


app.use(function(req, res, next) {
    app.locals.baseURL = config.app.baseURL;
    next();
});

var connection = mongoose.connect(config.mongoose.url);
autoIncrement.initialize(connection);

var User = require('./models/user.model');

passport.use('local', new LocalStrategy({usernameField: 'email', passwordField: 'password'},
    function(email, password, done) {
        User.findOne({ email: email, type: "associado" }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect e-mail.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        });
    }
));


i18n.configure({
    locales:['en', 'pt-BR'],
    directory: './locales',
    defaultLocale: 'pt-BR',
    //queryParameter: 'lang',
    autoReload: true,
    updateFiles: false,
    objectNotation: true
});

app.use(i18n.init);

passport.use('local-admin', new LocalStrategy({usernameField: 'username', passwordField: 'password'},
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({_id: id})
        .exec(function(err, user) {
        done(err, user);
    });
});

app.use(function(req, res, next) {
    if (req.session.old) {
        app.locals.old = req.session.old;
        req.session.old = {};
    } else {
        app.locals.old = {};
    }

    next();
});

app.use(function(req, res, next) {

    app.locals.now = moment();

    next();

});


String.prototype.toCapitalize = function()
{
   return this.toLowerCase().replace(/^.|\s\S/g, function(a) { return a.toUpperCase(); });
}
app.use(function(req, res, next) {
    if (req.user != undefined) {
        app.locals.user = req.user;
    } else {
        app.locals.user = undefined;
    }

    next();
});

app.use(function(req, res, next) {
    app.locals.serialize = function(obj) {
        var str = [];
        for(var p in obj) {

            if (p == "page") {
                delete obj.p;
                continue;
            }

            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }
        return str.join("&");
    };

    next();
});



app.use(function(req, res, next) {

    app.locals.thisURL = req.protocol + '://' + req.get('host') + req.originalUrl;

    if (req.query != undefined) {
        app.locals.query = req.query
    } else {
        app.locals.query = undefined;
    }

    next();
});

app.use(function(req, res, next) {

    req.denied = function(message) {
        message = message || 'Você não tem permissão para executar esta ação.';
        req.flash('sa_danger', message);
        return res.redirect('/');
    };

    next();

});

/*
* Mount menu with cats and subcats.
* */
app.use(function(req, res, next){

    mysql.select('categories')
        .where({ fixed: { o: '=', v: '1' } })
        .orderBy('position')
        .exec(function (rows) {

            var i = 0;
            var total = rows.length;
            for(var idx in rows)
            {
                var cat = rows[idx];
                getsub(rows[idx]);
                i++;
                theEnd(i);
            }

            function getsub(row) {
                mysql.select('categories')
                    .where({ categories_id: { o: '=', v: cat.id.toString()} })
                    .exec(function (subs) {
                        if (!subs) {
                            row.subcategorias = {}
                        }else{
                            row.subcategorias = subs;
                        }
                    })
            }

            function theEnd(i) {
                if (i == total) {
                    app.locals.categorias = rows;
                    next();
                }
            }
        });
});

//get tags - only with relations
app.use(function(req, res, next) {
    mysql.select('tags', ['distinct(A.id) as id', 'name', 'slug'])
        .join({ table: 'articles_has_tags', on: 'tags_id', key: 'A.id' })
        .orderBy('name')
        .exec(function (rows) {
            app.locals.tags = rows;
            next();
        })
});

//get all editions and set last edition to top site
app.use(function(req, res, next) {

    mysql.select('editions')
        .orderBy('number')
        .exec(function (rows) {
            app.locals.edicoes = rows;
            app.locals.ultima_edicao = rows[ (rows.length-1) ];
            next();
        });
});

/*
* Destinos do menu
* */
app.use(function(req, res, next) {
    mysql.select('categories', false)
        .join({ table: 'articles', on: 'categories_id', key: 'A.id', columns: ['id', 'slug', 'title', 'headline_title', 'main_img_path', 'headline_img_path'] })
        .where({ categories_id: { alias: 'A', o: '=', v: '1' } })
        .orderBy("RAND()")
        .limit('4')
        .exec(function (rows) {

            for (var idx in rows){
                var article = rows[idx];
                articlesHelper.getShowInfo(article);
            }

            app.locals.destinos = rows;
            app.locals.destinos_menu = rows;
            next();
        })
});

var routes = require('./routes/index.routes')(app);

app.use(function(req, res, next) {
    app.locals.old = {};
    req.session.old = {};
    next();
});

app.listen(config.app.port, function(){
    // console.log(config.app);
});
