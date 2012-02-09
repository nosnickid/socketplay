/**
 * User: steven
 * Date: 14/01/12
 * Time: 03:01
 */

var world    = require('./webroot/libs/World.js')
  , socketio = require('socket.io')
  , util = require('util');


var ServerGame = function(httpServer) {
    this._httpServer = httpServer;
    this._socket = socketio.listen(this._httpServer);
    this._clients = [];
    this._gameInterval = -1;
    this._world = new world.World();
    this._clientIdGenerator = 0;

    this._incomingNetworkQueue = [];

    this._socket.sockets.on('connection', this._onConnection.bind(this));

    return this;
};

ServerGame.prototype.PACKET_HANDLED = 'h';
ServerGame.prototype.PACKET_REQUEUE = 'r';


ServerGame.prototype._onConnection = function (socket) {
    var client = this.addClient(socket);

    socket.on('echo', function (data) {
        socket.emit('responder', data);
    }.bind(this));

    socket.on('ping', function (data) {
        var time = microtime(true);
        socket.emit('pong',  { 'time':time, 'data':data });
    }.bind(this));

    socket.on('input', function(data) {
        this._enqueueInput(client, data);
        this.tick();
    }.bind(this));


};

ServerGame.prototype.start = function() {
    /*var moi = this;
    if (this._gameInterval == -1) {
        this._gameInterval = setInterval(function() { moi.tick(); }, 50);
    }*/
};

ServerGame.prototype.stop = function() {
    if (this._gameInterval != -1) {
        clearInterval(this._gameInterval);
        this._gameInterval = -1;
    }
};

ServerGame.prototype.tick = function() {

    if (this._incomingNetworkQueue.length < this._clients.length) return;

    var desiredStep = this._world.getStep() + 1;

    // Pull out all the network events from the network circular queue, and apply any
    // that are relevant.
    this._incomingNetworkQueue.forEach(function(event, index) {
        if (this._handleIncomingNetwork(event, desiredStep) == ServerGame.PACKET_HANDLED) {
            delete this._incomingNetworkQueue[index];
        }
    }.bind(this));


    var allClientsAreReady = (this._clients.length > 0);
    this._clients.forEach(function(client) {
        allClientsAreReady = allClientsAreReady && (client.step == desiredStep);
    }.bind(this));

    if (allClientsAreReady) {
        util.debug("all clients are ready to step at " + this._world.getStep());

        this._world.tick();

        this._clients.forEach(function(client) {
            // client.socket.emit('responder', 'game tick');
            // client.socket.emit('tee', client.tee);
            // client.tee += 0.01;
            client.socket.emit('frame', {step: client.step});
        }.bind(this));
    }
};

ServerGame.prototype._handleIncomingNetwork = function(event, desiredStep) {
    if (event.data.step == desiredStep) {
        util.debug("client " + event.client.clientId + " step " + event.data.step + " handled");
        event.client.step = desiredStep;
        return ServerGame.PACKET_HANDLED;
    }

    // I do this when manually debugging sometimes. Ahem.
    if (event.data.step < desiredStep) {
        util.debug("client " + event.client.clientId + " resent step " + event.data.step + " ???");
        return ServerGame.PACKET_HANDLED;
    }

    // util.debug("client " + event.client + " step " + event.data.step + " skipped");
    return ServerGame.PACKET_REQUEUE;
};

ServerGame.prototype._enqueueInput = function(client, data) {
    this._incomingNetworkQueue.push({"client": client, "data": data});
};

ServerGame.prototype.addClient = function(socket) {
    var client = new ServerClient(socket, this._world.getStep(), this._clientIdGenerator++);
    this._clients.push(client);
    client.socket.emit('worldState', this._world.getState() );
    return client;
};

ServerGame.prototype.removeClient = function(socket) {
    this._clients.some(function(client, index) {
        if (client.socket == socket) {
            delete this._clients[index];
            return true;
        }
        return false;
    });
};

ServerGame.prototype.toString = function() {
    return "a server game";
};


var ServerClient = function(socket, step, clientId) {
    this.socket = socket;
    this.step = step;
    this.clientId = clientId;
    return this;
};

exports.ServerGame = ServerGame;