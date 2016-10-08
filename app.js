'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');

var socket = require('./routes/socket.js');
var queueManager = require('./managers/queue_manager.js');

var app = express();
var server = http.createServer(app);

/* Configuration */
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));

/* Socket.io Communication */
var io = require('socket.io').listen(server);
io.sockets.on('connection', socket);

io.sockets.on('connect', function (client) {
  // queueManager.connectNewClient(client);
});

/* Start server */
server.listen(app.get('port'), function () {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;





// var stdin = process.stdin;

// // without this, we would only get streams once enter is pressed
// stdin.setRawMode(true);

// // resume stdin in the parent process (node app won't quit all by itself
// // unless an error or process.exit() happens)
// stdin.resume();

// // i don't want binary, do you?
// stdin.setEncoding('utf8');

// // on any data into stdin
// stdin.on('data', function (key) {
//   // ctrl-c ( end of text )
//   if (key === '\u0003') {
//     process.exit();
//   }

//   console.log("Queue moved");
//   queueManager.dequeueTicket();
// });