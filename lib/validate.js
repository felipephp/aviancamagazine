module.exports = function (validation_function) {
    this.validation_rules = validation_function;
    return function (req, res, next) {

        req = this.validation_rules(req);

        var errors = req.validationErrors();
        if (errors) {
            var validationError = new Error('validation');
            validationError.type = 'ValidationError';
            validationError.errors = errors;
            next(validationError);
        }

        next();
    }
};

