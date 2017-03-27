var config = {};

config.twitter = {};
config.redis = {};
config.web = {};

config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
config.twitter.user_name = process.env.TWITTER_USER || 'username';
config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';
config.redis.uri = process.env.DUOSTACK_DB_REDIS;
config.redis.host = 'hostname';
config.redis.port = 6379;
config.web.port = process.env.WEB_PORT || 9980;

/*felipe*/
config.app = {};
config.app.port = process.env.WEB_PORT || 9980;
config.mongoose = {
	url: 'mongodb://127.0.0.1/avianca',
    production: "mongodb://user:pass@example.com:1234/stroeski-prod",
    // development: "mongodb://localhost:27017/storeski-dev",
    development: "mongodb://localhost/avianca",
    // test: "mongodb://localhost:27017/storeski-test",
  }

module.exports = config;