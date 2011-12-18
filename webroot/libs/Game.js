/**
 * User: steven
 * Date: 18/12/11
 * Time: 16:46
 */

/**************************************************
 * General / Init
 **************************************************/

var Game = function(server, fps, pingElement) {
    this.server = server;
    this.fps = fps;
    this._interval = undefined;
    this._socket = undefined;

    this._ping = new PingAverager();

    this._ui = {
        'pingElement': pingElement
    };

    return this;
};

Game.prototype.start = function() {
    if (!this.connect()) return false;

    if (this._interval == undefined) {
        this._interval = setInterval($.proxy(this.run, this), 1000 / this.fps)
    }

    return this._interval != undefined;
};

Game.prototype.run = function() {
    this.updateGame();
    this.updateUi();
}

Game.prototype.updateGame = function() {
    this.send("ping", microtime(true));
}

Game.prototype.updateUi = function() {
}


/**************************************************
 * Network Stuff
 **************************************************/
Game.prototype.connect = function() {
    if (this._socket) return false;

    this._socket = io.connect(this.server);
    this._socket.on("responder", $.proxy(this.onResponder, this));
    this._socket.on("pong", $.proxy(this.onPong, this));

    return true;
};

Game.prototype.onResponder = function(data) {
};

Game.prototype.onPong = function(data) {
    var now = microtime(true);
    var ping = now - data.data;

    this._ping.log(ping);

    this.setDisplayedPing(this._ping.get());


    //console.log("lag,lat (" + (now - data.data) + "," + (now - data.time) + ")");
};

Game.prototype.send = function(command, data) {
    this._socket.emit(command, data);
};


/**************************************************
 * UI
 **************************************************/

Game.prototype.setDisplayedPing = function(ping) {
    this._ui.pingElement.val(ping);
}
