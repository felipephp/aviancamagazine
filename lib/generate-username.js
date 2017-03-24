function randomString(len, charSet) {
    charSet = charSet || '0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

module.exports = function(text) {

    var random = randomString(4);

    text = text.toLowerCase();
    text = text.split(' ').join('').slice(0, 7) + random;

    return text;

};