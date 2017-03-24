exports.fullNumberToBRL = function(value) {
    value = value.toString();
    return value.slice(0, value.length - 2) + "," + value.slice(-2);
};