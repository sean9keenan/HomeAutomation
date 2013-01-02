var qs = require('querystring'),
    request = require('request')

function getAccessToken(id, secret, code, callback){
  var url = 'https://graph.facebook.com/oauth/access_token' +
            '?client_id=' + id + 
            '&redirect_uri=' + 'http://pixelboard.in/redirect' +
            '&client_secret=' + secret +
            '&code=' + code;
  
  request.post({url:url}, function(e, r, body){
    callback(e ? {} : qs.parse(body));
  });
}

function getUserData(accessToken, callback){
  console.log('CALLBACK =', callback);
  graphRequest(accessToken, 'me', callback);
}

function graphRequest(accessToken, path, callback){
  var graph_url = 'https://graph.facebook.com/',
      url = graph_url + (path ? path : 'me') +
            '?access_token=' + accessToken;
  request.get({url:url}, function(e, r, body){
    console.log('HTTP GET ' + url);
    if (!e && r.statusCode == 200){
      var jbody = JSON.parse(body);
      console.log('calling back with body:', jbody);
      console.log(jbody.id);
      try {
        console.log(callback);
        callback(jbody);
      }
      catch (e) {
        console.log('there was an error, yo');
        console.log('e:', e.message);
        console.log('stack:', e.stack);
        callback({});
      }
    }
    else {
      callback({});
    }
  });
}

module.exports = {
  getAccessToken : getAccessToken,
  getUserData : getUserData,
  graphRequest : graphRequest,
};
