var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var requireGuest = require('../lib/require-guest');
var requireLogin = require('../lib/require-login');
var requireAdmin = require('../domain/require-admin');
var checkValidation = require('../lib/check-validation');
var rules = require('../validation');

var sessions = require('./sessions.routes');
var user = require('./users.routes');
var pages = require('./pages.routes');
var admin = require('./admin.routes');
var materias = require('./materias.routes');
var welove = require('./welove.routes');
var search = require('./search.routes');
var videos = require('./videos.routes');

var adminTags = require('./admin/tags.routes');
var adminAutores = require('./admin/autores.routes');
var adminCategorias = require('./admin/categorias.routes');
var adminSubcategorias = require('./admin/subcategorias.routes');
var adminEdicoes = require('./admin/edicoes.routes');
var adminLocalizacoes = require('./admin/localizacoes.routes');
var adminMaterias = require('./admin/materias.routes');
var adminVideos = require('./admin/videos.routes');
var adminWeLove = require('./admin/welove.routes');

var configVideos = require('./admin/config_videos.routes');
var configSocial = require('./admin/config/social.routes');

module.exports = function(app) {

    // SITE
    app.get('/seeder', pages.seeder);
    app.get('/', pages.home);
    app.get('/quem-somos', pages.quem_somos);
    app.get('/edicoes', pages.edicoes);
    app.get('/welove', welove.index);
    app.post('/welove', multipartMiddleware, welove.send);
    // app.get('/contato', pages.contato);

    app.get('/buscar', search.go);
    app.get('/videos', videos.view);
    app.get('/videos/:slug', videos.video);

    app.get('/materias/:slug', materias.mostrar)

    app.get('/api/subcategorias/:subcategoria_id/materias', materias.porSubcategoriaApi);
    app.get('/api/categorias/:categoria_id/materias', materias.porCategoriaApi);

    // ADMIN
    app.get('/admin', requireAdmin, admin.dashboard);

    app.get('/admin/tags', requireAdmin, adminTags.index);
    app.get('/admin/tags/create', requireAdmin, adminTags.create);
    app.post('/admin/tags', requireAdmin, multipartMiddleware, adminTags.store);
    app.get('/admin/tags/:id/edit', requireAdmin, adminTags.edit);
    app.post('/admin/tags/:id', requireAdmin, multipartMiddleware, adminTags.update);
    app.get('/admin/tags/:id/delete', requireAdmin, adminTags.delete);

    // app.get('/admin/config/videos', requireAdmin, configVideos.index);
    // app.post('/admin/config/videos', requireAdmin, configVideos.update);

    app.get('/admin/config/social', requireAdmin, configSocial.index);
    app.post('/admin/config/social', requireAdmin, multipartMiddleware, configSocial.update);

    app.get('/admin/autores', requireAdmin, adminAutores.index);
    app.get('/admin/autores/create', requireAdmin, adminAutores.create);
    app.post('/admin/autores', requireAdmin, multipartMiddleware, adminAutores.store);
    app.get('/admin/autores/:id/edit', requireAdmin, adminAutores.edit);
    app.post('/admin/autores/:id', requireAdmin, multipartMiddleware, adminAutores.update);
    app.get('/admin/autores/:id/delete', requireAdmin, adminAutores.delete);

    app.get('/admin/videos', requireAdmin, adminVideos.index);
    app.get('/admin/videos/create', requireAdmin, adminVideos.create);
    app.post('/admin/videos', requireAdmin, multipartMiddleware, adminVideos.store);
    app.get('/admin/videos/:id/edit', requireAdmin, adminVideos.edit);
    app.post('/admin/videos/:id', requireAdmin, multipartMiddleware, adminVideos.update);
    app.get('/admin/videos/:id/delete', requireAdmin, adminVideos.delete);

    app.get('/admin/categorias', requireAdmin, adminCategorias.index);
    app.get('/admin/categorias/create', requireAdmin, adminCategorias.create);
    app.post('/admin/categorias', requireAdmin, multipartMiddleware, adminCategorias.store);
    app.get('/admin/categorias/:id/edit', requireAdmin, adminCategorias.edit);
    app.post('/admin/categorias/:id', requireAdmin, multipartMiddleware, adminCategorias.update);
    app.get('/admin/categorias/:id/delete', requireAdmin, adminCategorias.delete);

    app.get('/admin/subcategorias', requireAdmin, adminSubcategorias.index);
    app.get('/admin/subcategorias/create', requireAdmin, adminSubcategorias.create);
    app.post('/admin/subcategorias', requireAdmin, multipartMiddleware, adminSubcategorias.store);
    app.get('/admin/subcategorias/:id/edit', requireAdmin, adminSubcategorias.edit);
    app.post('/admin/subcategorias/:id', requireAdmin, multipartMiddleware, adminSubcategorias.update);
    app.get('/admin/subcategorias/:id/delete', requireAdmin, adminSubcategorias.delete);

    app.get('/admin/edicoes', requireAdmin, adminEdicoes.index);
    app.get('/admin/edicoes/create', requireAdmin, adminEdicoes.create);
    app.post('/admin/edicoes', requireAdmin, multipartMiddleware, adminEdicoes.store);
    app.get('/admin/edicoes/:id/edit', requireAdmin, adminEdicoes.edit);
    app.post('/admin/edicoes/:id', requireAdmin, multipartMiddleware, adminEdicoes.update);
    app.get('/admin/edicoes/:id/delete', requireAdmin, adminEdicoes.delete);

    app.get('/admin/localizacoes', requireAdmin, adminLocalizacoes.index);
    app.get('/admin/localizacoes/create', requireAdmin, adminLocalizacoes.create);
    app.post('/admin/localizacoes', requireAdmin, multipartMiddleware, adminLocalizacoes.store);
    app.get('/admin/localizacoes/:id/edit', requireAdmin, adminLocalizacoes.edit);
    app.post('/admin/localizacoes/:id', requireAdmin, multipartMiddleware, adminLocalizacoes.update);
    app.get('/admin/localizacoes/:id/delete', requireAdmin, adminLocalizacoes.delete);

    app.get('/admin/materias', requireAdmin, adminMaterias.index);
    app.get('/admin/materias/create', requireAdmin, adminMaterias.create);
    app.post('/admin/materias', requireAdmin, multipartMiddleware, adminMaterias.store);
    app.get('/admin/materias/:id/edit', requireAdmin, adminMaterias.edit);
    app.post('/admin/materias/:id', requireAdmin, multipartMiddleware, adminMaterias.update);
    app.get('/admin/materias/:id/delete', requireAdmin, adminMaterias.delete);

    app.get('/admin/welove', requireAdmin, adminWeLove.index);
    app.get('/admin/welove/create', requireAdmin, adminWeLove.create);
    app.post('/admin/welove', requireAdmin, adminWeLove.store);
    app.get('/admin/welove/:id/edit', requireAdmin, adminWeLove.edit);
    app.post('/admin/welove/:id', requireAdmin, adminWeLove.update);
    app.get('/admin/welove/:id/delete', requireAdmin, adminWeLove.delete);

    // SESSÕES

    app.get('/login', requireGuest, sessions.loginForm);
    app.post('/login', sessions.login);
    app.get('/logout', sessions.logout);
    app.get('/recuperar-senha',user.recoverPasswordPage);
    app.post('/recuperar-senha',user.recoverPassword);
    app.get('/resetar-senha', user.resetPasswordPage);
    app.get('/redefinir-senha',user.resetPasswordPage);
    app.post('/redefinir-senha', rules.resetPassword, checkValidation, user.resetPassword);
    app.get('/admin/login', admin.loginForm);
    app.post('/admin/login', admin.login);


    app.get('/tags/:tag_slug', materias.porTag);

    app.get('/:categoria_slug', materias.porCategoria);

    app.get('/:categoria_slug/:subcategoria_slug', materias.porSubcategoria);




};
