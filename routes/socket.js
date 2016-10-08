var queueManager = require('../managers/queue_manager.js');

// export function for listening to the socket
module.exports = function (socket) {
  var name = "Default test name";

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: [],
    queue: {
      num_in_front: "5",
      est_wait_time: "50"
    },
    ticket: null
  });


  // broadcast a user's message to other users
  socket.on('receive:customerid', function (customerId) {
    var jsonObj = {};
    jsonObj.client = socket;
    jsonObj.customerId = customerId;
    queueManager.connectNewClient(jsonObj);
  });

  socket.on('receive:ticketrequest', function (customerId) {
    console.log("Data is = " + JSON.stringify(customerId));
    console.log("SOCKET ID = " + socket.id);
    var customerData = {
      customerId: customerId,
      clientId: socket.id
    }
    queueManager.createTicket(customerData);
    // queueManager.testEmitter(socket.id);
    // console.log("Received ticket request for customerId " + JSON.stringify(data));
    // console.log("SocketId = " + socket.id);
    // socket.emit('send:ticket', {
    //   num_in_front: "hello",
    //   est_wait_time: "nerd",
    //   ticket_num: "lol"
    // });
  });




  //===================================================

  // notify other clients that a new user has joined
  // socket.broadcast.emit('user:join', {
  //   name: name
  // });

  // // broadcast a user's message to other users
  // socket.on('send:message', function (data) {
  //   console.log("Received message data " + JSON.stringify(data));
  //   socket.emit('send:ticket', {
  //     num_in_front: "100",
  //     est_wait_time: "10000"
  //   });
  // });



  // // validate a user's name change, and broadcast it on success
  // socket.on('change:name', function (data, fn) {
  // });

  // // clean up when a user leaves, and broadcast it to other users
  // socket.on('disconnect', function () {

  // });
};
