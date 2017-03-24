module.exports = function(req, res, next) {

    if (! req.user) {
        req.flash('danger', 'Você deve estar logado para acessar esta página');
        req.session.redirectURL = req.originalUrl;
        return res.redirect('/login');
    }
    next();
};
