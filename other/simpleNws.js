var ws = require("websocket-server");

var server = ws.createServer();

server.addListener("connection", function(connection){
  console.log('connect!')
  connection.addListener("message", function(msg){
    console.log("msg!" + msg)
    //server.send(msg);
    server.send(connection.id, msg);
  });
});

server.listen(80);