module.exports = function () {
    return function (req, res, next) {

        if (res.locals.flash == undefined) {
            res.locals.flash = {};
        }

        if (req.session.flash == undefined) {
            req.session.flash = {};
        }

        req.flash = res.flash = push;

        for (var key in req.session.flash) {
            res.locals.flash[key] = req.session.flash[key];
            req.session.flash[key] = null;
        }

        next()
    }
};

function push(type, msg) {
    var req = this.req || this;
    if (req.session.flash[type] == undefined) {
        req.session.flash[type] = [];
    }
    req.session.flash[type].push(msg);
    return this;
}