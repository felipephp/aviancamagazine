module.exports = function(req, res, next) {
    if (req.user) {
        req.flash('danger', 'Você já está logado.');
        return res.redirect('/');
    }
    next();
};