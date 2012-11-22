var http = require('http'),
    fs   = require('fs'),
    jQuery   = require('jquery'),
    util = require('./util'),
    devices = util.boards,
    conf = util.conf,
    io   = require('socket.io').listen(8080), // for npm, otherwise use require('./path/to/socket.io') 
    ws = require("websocket-server");

conf.db = util.parseConf(conf);
var db = util.db(conf);

/**
 * our socket transport events
 *
 * You will notice that when we emit the changes
 * in `create`, `update`, and `delete` we both
 * socket.emit and socket.broadcast.emit
 *
 * socket.emit sends the changes to the browser session
 * that made the request. not required in some scenarios
 * where you are only using ioSync for Socket.io
 *
 * socket.broadcast.emit sends the changes to
 * all other browser sessions. this keeps all
 * of the pages in mirror. our client-side model
 * and collection ioBinds will pick up these events
 */

io.sockets.on('connection', function (socket) {


  socket.on('event', function (data, callback) {
    console.log('customEvent Recieved' + data.outType + "msg stuff!" + data.msg);
    try {
      if (data.outType != null && data.msg != null){
        console.log('handlingOut');
        handleOutType(data.outType, data.msg)
      }
    } catch (err) {

    }

  });

  /**
   * device:create
   *
   * called when we .save() our new device
   *
   * we listen on model namespace, but emit
   * on the collection namespace
   */

  socket.on('device:create', function (data, callback) {
    // var id = guid.gen()
    //   , device = db.set('/device/' + id, data)
    //   , json = device._attributes;

    //devices.push(data);
    console.log(data);

    var s = new Device(data);

    s.id = s._id;

    s.save();

    var json = s;

   // checkState(s, null);
    //sendToArduino(s, true);

    socket.emit('devices:create', json);
    socket.broadcast.emit('devices:create', json);
    callback(null, json);
  });

  /**
   * devices:read
   *
   * called when we .fetch() our collection
   * in the client-side router
   */

  socket.on('devices:read', function (data, callback) {
    var list = [];

    console.log('read:' + data);

    Device.find(function (err, devices) {
      for (var i = 0; i < devices.length; i++) {
        list.push(devices[i]);
        console.log(devices[i]);
      }
      
      callback(null, list);
    });

    // db.each('device', function (device) {
    //   list.push(device._attributes);
    // });

  });

  /**
   * devices:update
   *
   * called when we .save() our model
   * after toggling its completed status
   */

  socket.on('devices:update', function (data, callback) {
    
    Device.findById(data.id, function (err, device) {
      checkState(data, device);
      jQuery.each(data, function(i, val) {
        device[i] = val;
      });
      //device.update(data);
      device.save();
      socket.emit('devices/' + data.id + ':update', device);
      socket.broadcast.emit('devices/' + data.id + ':update', device);
      callback(null, device);
    });

    // device.set(data);

    // var json = device._attributes;

    
  });

  /**
   * devices:delete
   *
   * called when we .destroy() our model
   */

  socket.on('devices:delete', function (data, callback) {
    // var json = db.get('/device/' + data.id)._attributes;

    console.log('deleting!!!!:' + data);

    Device.remove({_id : data.id}).exec();;

    socket.emit('devices/' + data.id + ':delete', data);
    socket.broadcast.emit('devices/' + data.id + ':delete', data);
    callback(null, data);
  });

});


var arduinoCallback = null;


var server = ws.createServer();

server.addListener("connection", function(connection){
  console.log('connect!')

  arduinoUpdateAllDevices();
  
  arduinoCallback = function(msg) {
    server.send(connection.id, msg);
    console.log("\n\nSending to Arduino:\n" + msg)
  };
  connection.addListener("message", function(msg){
    console.log("msg!" + msg)
    // server.send(connection.id, msg);

  });
});

server.listen(80);


function handleOutType (outType, msg){
  msg = processMsg(msg);
  if (outType == "arduino" && arduinoCallback != null){
    arduinoCallback(msg);
  } else if (outType == "global") {
    handleGlobal(msg);
  } else if (outType == "init") {
    arduinoUpdateAllDevices();
  }
}

function processMsg(msg){
  var patt = /{.*}/
  var toReplace = patt.exec(msg)
  for (var i = toReplace.length - 1; i >= 0; i--) {
    var out = handleReplace(toReplace[i])
    msg.replace(toReplace[i], out)
  };
}

function handleReplace(toReplace){
  if (toReplace[1].toString() == "#"){
    endOfIndex = toReplace.indexOf(".")
    id = toReplace.substring(2, endOfIndex);

    property = toReplace.substring(endOfIndex, toReplace.length - 1)

    evice.findById(id, function (err, device) {
      return device[property].toString()
    });

  }
  return toReplace;
}

function handleArduinoCmd(msg){

}

function checkState(device, oldDevice){
  console.log("Check State is called...")
  if (device.outputs != null){
    console.log("state was found :/" + device.outputs.length)
    for (var i = 0; i < device.outputs.length; i++){

      try{
      console.log("actionTrig:" + device.outputs[i]);
      var deviceJSON = JSON.parse(device.outputs[i]);
      if (deviceJSON.actionTrig == "state"){
        console.log("Some sort of state was found :)")
        var action = JSON.parse(deviceJSON.action);
        var count = 0;
        jQuery.each(device, function(j, jVal) {
          jQuery.each(action, function(k, kVal) {
            if (k == j){
              console.log("k j match :))" + jVal +"," + kVal)
              var isMatch = (jVal.toString() == kVal.toString());
              console.log('isMatch, prior' + isMatch);

              // Allow the {changed} operator to detect changes
              if (kVal.toString() == "{changed}"){
                isMatch = (jVal).toString() != oldDevice[k].toString()
              }

              // Allow the != comparitor in comparing states
              if (kVal.toString().substring(0, 2) == "!="){
                isMatch = (jVal != (kVal.substring(2)));
              }
              console.log('isMatch, apres' + isMatch)
              if (isMatch){
              console.log("Some sort of match was found!!")
                if (oldDevice == null || oldDevice[j] != jVal){
                  handleOutType(deviceJSON.outType,
                    deviceJSON.msg);
                }
              }
            }
          });
        });
      }
      } catch (err) {
      
      }
    }
  }
}

function checkInit(device){
    console.log("Check State is called...")
  if (device.outputs != null){
    console.log("state was found :/" + device.outputs.length)
    for (var i = 0; i < device.outputs.length; i++){

      try{
        console.log("actionTrig:" + device.outputs[i]);
        var deviceJSON = JSON.parse(device.outputs[i]);
        if (deviceJSON.actionTrig == "init"){
          handleOutType(deviceJSON.outType, deviceJSON.msg);
        }
      } catch (err) {
      
      }
    }
  }
}

function arduinoUpdateAllDevices() {
  Device.find(function (err, devices) {
    for (var i = 0; i < devices.length; i++) {
      checkInit(devices[i]);
      checkState(devices[i], null);
    }
    
  });
}

function handleGlobal(msg){
  try{
    var data = JSON.parse(msg);
    if (data.id != null){
      Device.findById(data.id, function (err, device) {
        if (data.outType == 'global'){
          if (device.outputs != null){
            console.log("state was found :/" + device.outputs.length)
            for (var i = 0; i < device.outputs.length; i++){
              console.log("actionTrig:" + device.outputs[i]);
              var deviceJSON = JSON.parse(device.outputs[i]);
              if (deviceJSON.global == data.global){
                handleOutType(deviceJSON.outType, deviceJSON.msg);
              }
            }
          }
        }
      });
    } else {
      //TODO: implement true global (without object ID) in command here
    }

  } catch (err){

  }
}



// Depcrecated!!
function sendToArduino(device, needPinInit){
  var action = "dashboardOff"

  var pin = device.pinNum;
  if (needPinInit && arduinoCallback != null){
    arduinoCallback("cmd:initPin;pin:" + pin + ";type:output");
  }
  if (device.completed) {
    action = "dashboardOn"
  }
  if (arduinoCallback != null && device.outputs != null && device.outputs.length != null){
    var allOutputs = device.outputs;
    for (var i = 0; i < allOutputs.length; i++){
      if (allOutputs[i].action === action && typeof allOutputs[i].msg == "string"){
        arduinoCallback(allOutputs[i].msg);
      }
    }
  }
}


// io.sockets.on('connection', function(socket) {
//   socket.on('data', function(data){
//     socket.broadcast.emit('data', data);
//   })
// });


// var webroot = './assets',
//   port = 80;
// var file = new(static.Server)(webroot, {
//   cache: 600,
//   headers: { 'X-Powered-By': 'node-static' }
// });
// http.createServer(function(req, res) {
//   req.addListener('end', function() {
//     file.serve(req, res, function(err, result) {
//       if (err) {
//         console.error('Error serving %s - %s', req.url, err.message);
//         if (err.status === 404 || err.status === 500) {
//           file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
//         } else {
//           res.writeHead(err.status, err.headers);
//           res.end();
//         }
//       } else {
//         console.log('%s - %s', req.url, res.message);
//       }
//     });
//   });
// }).listen(port);
// console.log('node-static running at http://localhost:%d', port);


// // Reducing socket.io log (debug) statements
// io.set('log level', 2);

// http.createServer(function (request, response) {
// 	fs.readFile(__dirname+'/assets/index.html', function (err, data) {
// 		if (err) throw err;
// 		//response.setHeader("Content-Type", "text/html");
// 		response.end(data);
// 	});
// }).listen(8888);

// function set(obj, path, value){
//   var lastObj = obj;
//   var property;
//   path.split('.').forEach(function(name){
//     if (name) {
//       lastObj = obj;
//       obj = obj[property=name];
//       if (!obj) {
//         lastObj[property] = obj = {};
//       }
//     }
//   });
//   lastObj[property] = value;
// }

// var model = {'connection':{'connected': 'true'}};
// var clients = [];

// // socket.io 
// io.sockets.on('connection', function(socket){ 
//   clients.push(socket);
//   // new client is here! 
//   socket.on('channel', function(msg){
//     console.log('message:');
//     console.log(msg);
//     set(model, msg.path, msg.value);
//     clients.forEach(function(otherClient){
//       if (socket !== otherClient){
//         console.log("emitting..");
//         otherClient.emit("channel", msg);
//       }
//     });
//     console.log(msg);
//   });
//   socket.emit("channel", {path:'', value:model});
// });
