// This code is fallback for https://github.com/Worlize/WebSocket-Node

// add the broadcast to  https://gist.github.com/1219165 
//    2011.11.30 tato@http://www.facebook.com/javascripting

// Example of how to fallback to alternative websocket library for old protocol clients
// see https://gist.github.com/1148686

var http = require('http'),
    WebSocketRequest = require('websocket').request,
    WebSocketServer = require('websocket').server,
    ws = require('websocket-server');

//Copy to WebSocketRequest

WebSocketRequest.prototype.connections = [];
WebSocketRequest.prototype.handleRequestAccepted = WebSocketServer.prototype.handleRequestAccepted;
WebSocketRequest.prototype.handleConnectionClose = WebSocketServer.prototype.handleConnectionClose;
WebSocketRequest.prototype.broadcastUTF = WebSocketServer.prototype.broadcastUTF;

var httpServer = http.createServer(function(request, response) {
    console.log((new Date()) + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});
httpServer.listen(80, function() {
    console.log((new Date()) + " Server is listening on port 8080");
});


// node-websocket-server

var miksagoConnection = require('./node_modules/websocket-server/lib/ws/connection');

var miksagoServer = ws.createServer();
miksagoServer.server = httpServer;

miksagoServer.addListener('connection', function(connection) {
    // Add remoteAddress property
    connection.remoteAddress = connection._socket.remoteAddress;
    
    // We want to use "sendUTF" regardless of the server implementation
    connection.sendUTF = connection.send;
    handleConnection(connection);
});


// WebSocket-Node config

var wsServerConfig =  {
    // All options *except* 'httpServer' are required when bypassing
    // WebSocketServer.
    maxReceivedFrameSize: 0x10000,
    maxReceivedMessageSize: 0x100000,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 0x4000,
    keepalive: true,
    keepaliveInterval: 20000,
    assembleFragments: true,
    // autoAcceptConnections is not applicable when bypassing WebSocketServer
    // autoAcceptConnections: false,
    disableNagleAlgorithm: true,
    closeTimeout: 5000
};


// Handle the upgrade event ourselves instead of using WebSocketServer

var wsRequest={};
httpServer.on('upgrade', function(req, socket, head) {

    if (typeof req.headers['sec-websocket-version'] !== 'undefined') {

        // WebSocket hybi-08/-09/-10 connection (WebSocket-Node)
        wsRequest = new WebSocketRequest(socket, req, wsServerConfig);
        try {
            wsRequest.readHandshake();
            var wsConnection = wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
            wsRequest.handleRequestAccepted(wsConnection);
            handleConnection(wsConnection);
        }
        catch(e) {
            console.log("WebSocket Request unsupported by WebSocket-Node: " + e.toString());
            return;
        }

    } else {

        // WebSocket hixie-75/-76/hybi-00 connection (node-websocket-server)
        if (req.method === 'GET' &&
            (req.headers.upgrade && req.headers.connection) &&
            req.headers.upgrade.toLowerCase() === 'websocket' &&
            req.headers.connection.toLowerCase() === 'upgrade') {
            new miksagoConnection(miksagoServer.manager, miksagoServer.options, req, socket, head);
        }

    }

});


// A common connection handler

function handleConnection(connection) {
    console.log((new Date()) + " Connection accepted.");
    connection.sendUTF(" Connection accepted.");

    connection.addListener('message', function(wsMessage) {
        var message = wsMessage;

        // WebSocket-Node adds a "type", node-websocket-server does not
        if (typeof wsMessage.type !== 'undefined') {
            if (wsMessage.type !== 'utf8') {
                return;
            }
            message = wsMessage.utf8Data;
        }
        console.log("Received Message: " + message);
        
        //connection.sendUTF(message);
        if(miksagoServer.broadcast)miksagoServer.broadcast('broadcastUTF0:'+message);
        if(wsRequest.broadcastUTF)wsRequest.broadcastUTF('broadcastUTF1:'+message);
    });
    
    connection.addListener('close', function() {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
}