module.exports = function(conf) {
  var mongoose = require('mongoose'),
      Schema   = mongoose.Schema,
      objectRef = function(name) {
        return {type:Schema.Types.ObjectId, ref: name}
      },
      crypto   = require('crypto'),
      uri = 'mongodb://' +
        String(conf.db.user) + ':' +
        String(conf.db.pwd) + '@' + 
        String(conf.db.host) + ':' +
        String(conf.db.port) + '/' +
        String(conf.db.name),
      uri2 = 'mongodb://' + String(conf.db.host) +
             ':' + String(conf.db.port) + '/' +
             String(conf.db.name);

      db = mongoose.createConnection(uri2);
  if (db) {
    console.log('Db connection created to', uri2, '(', typeof(db), ')');
  }
  
  
  exports.DeviceSchema = DeviceSchema = new Schema({
    name          : String,
    type          : String,
    state         : String,
    id            : String,
    completed     : Boolean,
    pinNum        : Number,
    dashboard     : Boolean,
    hostDevice    : String,
    value         : Number,
    isAnalog      : Boolean,
    isOutput      : Boolean,
    defaultType   : String,
    forceInit     : Boolean,
    outputs       : [String], 
    pendingActions: [{target: String, action: String}],

    dateCreated  : String, // var x = newDate(); x.toUTCString();
    dateModified : String, // ^
    map          : { src: String, link: String },
    _owners      : objectRef('User'),
    _comments    : [objectRef('Comment')],
  });

  exports.UserSchema = UserSchema = new Schema({
    name         : String,
    email        : String,
    picture      : String, // URL 
    phone        : String, // '484 278 1336'
    oauthId      : String,
    oauthToken   : String,
    dateCreated  : String, // var x = new Date(); x.toUTCString();
    dateModified : String, // ^
    _sensors     : [objectRef('Device')],
    _accessTokens: [objectRef('DeviceToken')],
  });

  exports.UserSchema.methods.addToken = UserSchema.methods.addToken = function(tokenVal, callback) {
    var user = this,
        token = new DeviceToken({
          _user : user._id,
          raw   : tokenVal,
          dateCreated : (new Date()).toUTCString(),
          lastAccess : (new Date()).toUTCString(),
        });
    token.save(function(err) {
      if (err) {
        callback(null);
      }
      else {
        user._accessTokens.push(token);
        user.save(function(err) {
          if (err) {
            callback(null);
          }
          else {
            callback(token);
          }
        });
      }
    });
  };

  exports.UserSchema.methods.getToken = UserSchema.methods.getToken = function(callback) {
    if (this._accessTokens.length > 0) {
      var token = this._accessTokens[this._accessTokens.length-1];
      console.log('GOT TOKEN =', token);
      token.lastAccess = (new Date()).toUTCString();
      token.save(function(err){
        if (err) {
          callback(null);
        }
        else {
          callback(token);
        }
      });
    }
    else {
      this.genToken(callback);
    }
  };

  exports.UserSchema.methods.update = UserSchema.methods.update = function(callback) {
    this.dateModified = (new Date()).toUTCString();
    this.save(callback);
  };

  exports.UserSchema.methods.genToken = UserSchema.methods.genToken = function(callback) {
    var user = this;
    crypto.randomBytes(48, function(ex, buf) {
        user.addToken(buf.toString('hex'), callback);
    });
  };

  exports.CommentSchema = CommentSchema = new Schema({
    raw         : String,
    deleted     : Boolean,
    dateCreated : String, // var x = newDate(); x.toUTCString();
    dateModified: String, // ^
    _owner      : objectRef('User'),
    _board      : objectRef('Board'),
    _parent     : objectRef('Comment'),
    _children   : [objectRef('Comment')],
  });


  exports.DeviceTokenSchema = DeviceTokenSchema = new Schema({
    _user      : objectRef('User'),
    raw        : String,
    dateCreated: String, // var x = newDate(); x.toUTCString();
    lastAccess : String, // ^
  });

  exports.objectRef = objectRef = function(name) {
    return {
      type: Schema.Types.ObjectId,
      ref: name
    };
  };

  exports.makeGetBy = makeGetBy = function(thing, populates){
    return (function(key, value, callback){
      var args = {};
      args[key] = value;
      x = thing.findOne(args);
      populates.every(function(a){
        x = x.populate(a);
        return true;
      });
      x.exec(function(err, obj){
        if (!err && obj){
          callback(obj);
        }
        else {
          callback(null);
        }
      });
    });
  };
 
  exports.getUserBy = getUserBy = function(key, value, callback){
    var args = {};
    args[key] = value;
    User.findOne(args)
        .populate('_boards')
        .populate('_comments')
        .populate('_accessTokens').exec(function(err, user){
      if (!err && user) {
        callback(user);
      }
      else {
        callback(null);
      }
    });
  };
  
  exports.getUser = getUser = function(userData, oauthToken, callback) {
    getUserBy('oauthId', userData.id, function(user) {
      if (user) {
        callback(user);
      }
      else {
        var now  = (new Date()).toUTCString(),
            user = new User({
              name: userData.name,
              email: userData.email,
              picture: 'https://graph.facebook.com/'+userData.id+'/picture',
              phone: null,
              oauthId : userData.id,
              oauthToken : oauthToken,
              dateCreated: now,
              dateModified: now,
              _boards: [],
              _omments: [],
              _accessTokens: [],
            });
        user.update(function(err) {
          console.log(err);
          console.log("ERROR MUDDAFUGGA");
          callback(err ? null : user);
        });
      }
    });
  };

  exports.User = User = db.model('User', UserSchema);
  exports.Device = Device = db.model('Device', DeviceSchema);
  exports.Comment = Comment = db.model('Comment', CommentSchema);
  exports.DeviceToken = DeviceToken = db.model('DeviceToken', DeviceTokenSchema);
  exports.getDeviceBy = getDeviceBy = makeGetBy(Device, ['_owners', '_comments']);
  exports.getUserBy = getUserBy = makeGetBy(User, ['_boards', '_comments', '_accessTokens']);
  exports.getCommentBy = getCommentBy = makeGetBy(Comment, ['_owner', '_parent', '_board', '_children']);
  exports.getDeviceTokenBy = getDeviceTokenBy = makeGetBy(DeviceToken, ['_user']);
  return exports;
};

