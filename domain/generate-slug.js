var removeAccents = require('../lib/remove-accents');

module.exports = function(string) {

    string = removeAccents(string);
    string = string.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    string = string.toLowerCase();
    string = string.replace(/\s/g, '-');
    return string;

}
