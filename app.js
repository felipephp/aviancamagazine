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

//var enFile = require(__dirname + '/locales/en');
//var ptFile = require(__dirname + '/locales/pt-BR');

app.set('views', './views');
app.set('view engine', 'pug');


app.use(function(req, res, next) {
    app.locals.baseURL = config.app.baseURL;
    next();
});

var connection = mongoose.connect(config.mongoose.url);
autoIncrement.initialize(connection);

var User = require('./models/user.model');

//var user = new User;
//user.username = "admin";
//user.email = "gabriel@verumeventos.com.br";
//user.type = "admin";
//user.password = "popai2016*";
//user.save(function(err, saved) {
//    console.log(saved);
//});

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

app.use(function(req, res, next){
    Categoria.find({ 'fixed_menu' : true })
        .sort('ordem')
        .populate(['subcategorias','subcategoria'])
        .exec(function(err, menuCats){
            if (err) { return next(err); }

            app.locals.categorias = menuCats;

            next();
        })
});

// app.use(function(req, res, next) {
//
//     //Agenda Cultural
//     Materia.find({ categoria : '589bbe420551da698b474c05' })
//         .populate('subcategoria')
//         .populate('categoria')
//         .limit(3)
//         .sort('created_at')
//         .exec(function(err, res)
//         {
//             //if (err) { return next(err); }
//             app.locals.AgendaCultural = res;
//             next();
//         });
// });

app.use(function(req, res, next) {

    Tag.find({})
        .sort('nome')
        .exec(function(err, tags) {
            if (err) { return next(err); }
            app.locals.tags = tags;
            next();
        });

});

app.use(function(req, res, next) {

    Edicao.findOne({})
        .sort('-numero')
        .limit(1)
        .exec(function(err, result) {
            if (err) { return next(err); }
            app.locals.ultima_edicao = result;
            next();
        });
});

app.use(function(req, res, next) {

    Edicao.find({})
        .sort('-numero')
        .limit(3)
        .exec(function(err, result) {
            if (err) { return next(err); }
            app.locals.ultimas_edicoes = result;
            next();
        });
});

app.use(function(req, res, next) {

    //Capa
    Materia.findOne({subcategoria: "58a5eab84f533c41dad42be4"})
        .sort('-created_at')
        .populate(['categoria', 'subcategoria'])
        .exec(function(err, result) {
            if (err) { return next(err); }
            app.locals.capa = result;
            next();
        });
});

app.use(function(req, res, next) {

    Edicao.find({})
        .sort('-numero')
        // .limit(8)
        .exec(function(err, result) {
            if (err) { return next(err); }
            app.locals.edicoes = result;
            next();
        });
});

app.use(function(req, res, next) {

    Config.find({key: {$in: ['video1_url', 'video2_url', 'video3_url', 'video4_url', 'video5_url']}})
        .exec(function(err, result) {
            if (err) { return next(err); }
            app.locals.videos = result;
            next();
        });
});

app.use(function(req, res, next) {

    app.locals.getRandomFromArray = function(myArray) {
        var rand = myArray[Math.floor(Math.random() * myArray.length)];
        return rand;
    }

    Materia.find({})
        // .sort('-created_at')
        .sort('-available_at')
        .populate(['categoria', 'subcategoria', 'autor'])
        .exec(function(err, result) {
            if (err) { return next(err); }
            app.locals.materias = result;
            next();
        });
});

app.use(function(req, res, next) {

    Materia.find({categoria: '589bbddcd469b56893cfc27b'})
        .select({"conteudo":false})
        .sort('-created_at')
        .populate(['categoria', 'subcategoria', 'autor'])
        .exec(function(err, result) {
            if (err) { return next(err); }
            
            var destinos_menu = [];

            //Inicia no 2, pois os [0,1] ja são exibidos no slider principal 
            var idx = 2;
            while(idx < 6)
            {
                destinos_menu.push(result[idx]);
                idx++;
            }

            app.locals.destinos_menu = destinos_menu;
            app.locals.destinos = result;
            next();
        });
});

app.use(function(req, res, next) {
    Materia.findOne({categoria: '589bbddcd469b56893cfc27b', edicao: app.locals.ultima_edicao._id})
        .sort('-created_at')
        .populate(['categoria', 'subcategoria', 'autor'])
        .exec(function(err, result) {
            if (err) { return next(err); }
            app.locals.ultimo_destino = result;
            next();
        });
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
