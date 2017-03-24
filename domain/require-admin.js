module.exports = function(req, res, next) {
    if (req.user == undefined || req.user.type != "admin") {
        req.flash('danger', 'Você não tem permissão para acessar essa página. Privilégios de administrador são necessários para executar esta ação. Por favor, faça o login como administrador.');
        return res.redirect('/admin/login');
    }
    next();
};
