exports.boards = require('./boards');
exports.conf   = require('./conf');
exports.db     = require('./db');
exports.fb     = require('./fb');
exports.parseConf = parseConf = function(conf) {
  var DB_USER = conf.db.user,
      DB_PWD  = conf.db.pwd,
      DB_HOST = conf.db.host,
      DB_PORT = conf.db.port,
      DB_NAME = conf.db.name;
  if (process.env.NODE_ENV === 'production') {
    try {
      var fs = require('fs'),
          env = JSON.parse(fs.readFileSync(conf.envFile, 'utf-8'));
      DB_USER = env.db.user;
      DB_PWD = env.db.pwd;
      DB_HOST = env.db.host;
      DB_PORT = parseInt(env.db.port);
      DB_NAME = env.db.name;
      console.log('Parsed '+conf.envFile+' successfully');
    }
    catch (e) {
      console.log('Error reading '+conf.envFile);
    }
  }
  return {
    user: DB_USER,
    pwd: DB_PWD,
    host: DB_HOST,
    port: DB_PORT,
    name: DB_NAME,
  }
};
