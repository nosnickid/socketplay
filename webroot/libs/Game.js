/**
 * User: steven
 * Date: 18/12/11
 * Time: 16:46
 */

/**************************************************
 * General / Init
 **************************************************/

var Game = function(server, fps, pingElement, pingGraphContainer) {
    this.server = server;
    this.fps = fps;
    this._interval = undefined;
    this._socket = undefined;

    this._ping = new PingAverager();
    this._displayPingGraph = false;

    this._ui = {
        'pingElement': pingElement,
        'pingGraphContainer': pingGraphContainer
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
};

Game.prototype.updateGame = function() {
    this.send("ping", microtime(true));
};

Game.prototype.updateUi = function() {
    this.setDisplayedPing();
};

Game.prototype.displayPingGraph = function(show) {
    this._displayPingGraph = show;
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
    window.console.log(data);
};

Game.prototype.onPong = function(data) {
    var now = microtime(true);
    var ping = now - data.data;

    this._ping.log(ping);
};

Game.prototype.send = function(command, data) {
    this._socket.emit(command, data);
};


/**************************************************
 * UI
 **************************************************/

Game.prototype.setDisplayedPing = function() {
    this._ui.pingElement.val(this._ping.get());
    if (this._displayPingGraph) {
        $.plot($(this._ui.pingGraphContainer), this._ping.getPingLog(), {
            yaxis: {
                ticks: 10,
                min: 0,
                max: 0.1
            }
        });
    }

};