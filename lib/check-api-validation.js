module.exports = function(req, res, next) {

    var errors = req.validationErrors();

    req.asyncValidationErrors()
        .then(function() {
            next();
        })
        .catch(function(errors) {

            var message = "";

            for (var x in errors) {
                //console.log(errors[x].msg);
                message += errors[x].msg + "\n";
            }


            return res.send({message: message});

        });



};