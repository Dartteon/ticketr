var uuid = require('uuid');

var queue = [];
// var clients = [];
var currTicketNum = 1;

var clients = {};

var clientIdToTicket = {};
var custIdToClientId = {};  //Maps customerId to client
var clientIdToCustId = {};  //Maps clientId to custId
var custIdToTicket = {};    //Maps custId to current ticket

function connectNewClient(data) {
    var client = data.client;
    var clientId = client.id;
    clients[clientId] = client;
    console.log("Client pushed.. num clients in list = " + Object.keys(clients).length);
    client.on('disconnect', function () {
        delete clients[client.id];
    });

    var customerId = data.customerId;
    if (custIdToTicket[customerId]) {
        //customer has existing ticket
        clientIdToCustId[clientId] = customerId;
        custIdToClientId[customerId] = clientId;
        clientIdToTicket[clientId] = custIdToTicket[customerId];
    }
    updateAllClients();
}

function createTicket(customerData) {
    console.log("Customer data received " + JSON.stringify(customerData));
    var customerId = customerData.customerId;
    var clientId = customerData.clientId;
    if (customerId == null || customerId == undefined || customerId == "undefined") {
        //Customer is new - generate a new UUID for him!
        customerId = uuid.v4();
        console.log("Generated new UUID for customer " + customerId + "\n\n\n");
    }
    if (custIdToTicket[customerId]) {
        //customer already has a ticket!
        var existingTicket = custIdToTicket[customerId];
        clientIdToCustId[clientId] = customerId;
        clientIdToTicket[clientId] = existingTicket;
        updateAllClients();
        return;
    }
    var ticketNum = currTicketNum++;
    var newTicket = {
        ticket_num: ticketNum,
        customer_id: customerId,
        client_id: clientId
    }
    clientIdToTicket[clientId] = newTicket;
    custIdToTicket[customerId] = newTicket;
    custIdToClientId[customerId] = clientId;
    clientIdToCustId[clientId] = customerId
    queue.push(newTicket);
    console.log("New ticket created = " + JSON.stringify(newTicket));

    console.log("clientIdToTicket\n" + JSON.stringify(clientIdToTicket) + "\n\n");
    console.log("custIdToClientId\n" + JSON.stringify(custIdToClientId) + "\n\n");
    console.log("clientIdToCustId\n" + JSON.stringify(clientIdToCustId) + "\n\n");
    console.log("custIdToTicket\n" + JSON.stringify(custIdToTicket) + "\n\n");
    
    updateAllClients();
    // dequeueTicket();
}

function removeSpecificTicket(customerId) {
    var poppedClientId = custIdToClientId[customerId];
    console.log("Poppedclientid  = " + poppedClientId);
    var poppedTicket = custIdToTicket[customerId];
    var poppedClient = clients[poppedClientId];
    if (poppedClient == undefined) {
        console.log("Error popping");
        return;
    }
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
    if (queue.length <= 0) {
        console.log("Nothing in queue to dequeue!");
        return;
    }
    var poppedTicket = queue.pop();
    var poppedCustId = poppedTicket.customer_id;
    var poppedClientId = custIdToClientId[poppedCustId];
    var poppedClient = clients[poppedClientId];

    console.log("Poppedcustid = " + poppedCustId + "\n\n");
    console.log("Dequeue ticket called, q len = " + queue.length);

console.log("clientIdToTicket\n" + JSON.stringify(clientIdToTicket) + "\n\n");
console.log("custIdToClientId\n" + JSON.stringify(custIdToClientId) + "\n\n");
console.log("clientIdToCustId\n" + JSON.stringify(clientIdToCustId) + "\n\n");
console.log("custIdToTicket\n" + JSON.stringify(custIdToTicket) + "\n\n");

    if (poppedClient == undefined) {
        console.log("Error popping");
        return;
    }

    poppedClient.emit('send:ticket', {
        ticket_num: "Your Turn!",
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
    var clientKeys = Object.keys(clients);
    for (var i = 0; i < clientKeys.length; i++) {
        var client = clients[clientKeys[i]];
        console.log("Looping client " + client.id);

        var clientId = client.id;
        console.log(JSON.stringify(clientIdToCustId) + "\n");
        var custId = clientIdToCustId[clientId];
        if (custId) {
            console.log("Client has valid ticket");
            //client has valid ticket
            var ticket = clientIdToTicket[clientId];
            var indexInQueue = queue.indexOf(ticket);
            var remainingTime = timePerTicket * (indexInQueue + 1);
            ticket.est_wait_time = remainingTime;
            ticket.num_in_front = indexInQueue;
            ticket.num = (indexInQueue < 0) ? "Your Turn!" : ticket.num;
            client.emit('send:ticket', ticket);
        }
        else {
            console.log("Client not mapped to ticket - custId = " + custId);
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

