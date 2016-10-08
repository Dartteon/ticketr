var uuid = require('uuid');

var queue = [];
// var clients = [];
var currTicketNum = 1;

var clients = {};

var clientIdToTicket = {};
var custIdToClientId = {};  //Maps customerId to client
var clientIdToCustId = {};  //Maps clientId to custId
var custIdToTicket = {};    //Maps custId to current ticket

function connectNewClient(client) {
    clients[client.id] = client;
    console.log("Client pushed.. num clients in list = " + Object.keys(clients).length);
    client.on('disconnect', function () {
        delete clients[client.id];
    });
    updateAllClients();
}

function createTicket(customerData) {
    console.log("Customer data received " + JSON.stringify(customerData));
    var customerId = customerData.customerId;
    if (customerId == null || customerId == undefined) {
        //Customer is new - generate a new UUID for him!
        customerId = uuid.v4();
        console.log("Generated new UUID for customer " + customerId);
    }
    var clientId = customerData.clientId;
    var ticketNum = currTicketNum++;
    var newTicket = {
        ticket_num: ticketNum,
        customer_id: customerId,
        client_id: clientId
    }
    clientIdToTicket.clientId = newTicket;
    custIdToTicket.customerId = newTicket;
    custIdToClientId.customerid = clientId;
    queue.push(newTicket);
    console.log("New ticket created = " + JSON.stringify(newTicket));

    // dequeueTicket();
}

function removeSpecificTicket(customerId) {
    var poppedClientId = custIdToClientId[customerId];
    var poppedTicket = custIdToTicket[customerId];
    var poppedClient = clients[poppedClientId];

    poppedClient.emit('send:ticket', {
        num_in_front: -1,
        est_wait_time: 0
    });

    delete clients[poppedClientId];
    delete clientIdToTicket[poppedClientId];
    custIdToClientId[poppedClientId] = null;
    delete clientIdToCustId[poppedClientId];
    custIdToTicket[poppedCustId] = undefined;

    updateAllClients();
}

function dequeueTicket() {
    console.log("Dequeue ticket called, q len = " + queue.length);
    if (queue.length <= 0) {
        console.log("Nothing in queue to dequeue!");
        return;
    }
    var poppedTicket = queue.pop();
    var poppedClientId = poppedTicket.client_id;
    var poppedCustId = poppedTicket.customer_id;
    var poppedClient = clients[poppedClientId];

    poppedClient.emit('send:ticket', {
        num_in_front: -1,
        est_wait_time: 0
    });

    delete clients[poppedClientId];
    delete clientIdToTicket[poppedClientId];
    custIdToClientId[poppedClientId] = null;
    delete clientIdToCustId[poppedClientId];
    custIdToTicket[poppedCustId] = undefined;

    updateAllClients();
}

var timePerTicket = 10;
function updateAllClients() {
    for (var i = 0; i < clients.length; i++) {
        var client = clients[i];
        console.log("Looping client " + client.id);

        var clientId = clients[i].id;
        if (clientIdToTicket[clientId] != null) {
            //client has valid ticket
            var ticket = clientIdToTicket[clientId];
            var indexInQueue = queue.indexOf(ticket);
            var remainingTime = timePerTicket * (indexInQueue + 1);
            ticket.est_wait_time = remainingTime;
            ticket.num_in_front = indexInQueue;
            clients[i].emit('send:ticket', ticket);
        }
        else {
            console.log("Client not mapped to ticket - clientId = " + client.id);
            var emittedQueue = {
                num_in_front: queue.length,
                est_wait_time: timePerTicket * (queue.length + 1)
            };
            client.emit('send:queue', emittedQueue);
        }
    }
}




function testEmitter(socketid) {
    console.log("Received emit call to " + socketid);
    console.log(clients[0].id);
    clients[0].emit('send:ticket', {
        num_in_front: "test",
        est_wait_time: "emit",
        ticket_num: "received"
    });
    updateAllClients();
    // dequeueTicket();
    // io.to(socketid).emit('send:ticket', {
    //   num_in_front: "test",
    //   est_wait_time: "emit",
    //   ticket_num: "received"
    // });
}

module.exports = {
    testEmitter: testEmitter,
    connectNewClient: connectNewClient,
    createTicket: createTicket,
    dequeueTicket: dequeueTicket
}

