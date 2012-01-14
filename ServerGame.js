/**
 * User: steven
 * Date: 14/01/12
 * Time: 03:01
 */

exports.ServerGame = function() {
    this._clients = [];
    this._gameInterval = -1;

    return this;
}

exports.ServerGame.prototype.start = function() {
    var moi = this;
    if (this._gameInterval == -1) {
        this._gameInterval = setInterval(function() { moi.tick(); }, 50);
    }
}

exports.ServerGame.prototype.stop = function() {
    if (this._gameInterval != -1) {
        clearInterval(this._gameInterval);
        this._gameInterval = -1;
    }
}

exports.ServerGame.prototype.tick = function() {
    this._clients.forEach(function(client) {
        //client.socket.emit('responder', 'game tick');
        client.socket.emit('tee', client.tee);
        client.tee += 0.01;
    });
}

exports.ServerGame.prototype.addClient = function(socket) {
    var client = new ServerClient(socket);
    this._clients.push(client);
}


var ServerClient = function(socket) {
    this.socket = socket;
    this.tee = 0;
    return this;
}