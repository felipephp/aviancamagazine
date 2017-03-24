module.exports = function(req, res, next) {

    var errors = req.validationErrors();

    req.asyncValidationErrors()
        .then(function() {
            next();
        })
        .catch(function(errors) {

            for (var x in errors) {
                //console.log(errors[x].msg);
                req.flash('danger', errors[x].msg);
            }

            req.session.old = req.body;

            return res.redirect('back');

        });



};