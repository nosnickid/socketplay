/**
 * User: steven
 * Date: 18/12/11
 * Time: 16:46
 *
 * (c) Steven Dickinson
 */

/**************************************************
 * General / Init
 **************************************************/

var ClientGame = function(server, fps, pingElement, pingGraphContainer) {
    this.server = server;
    this.fps = fps;
    this.tee = 0;

    this._interval = undefined;
    this._socket = undefined;
    this._world = undefined;

    this._ping = new PingAverager();
    this._displayPingGraph = false;

    this._ui = {
        'pingElement': pingElement,
        'pingGraphContainer': pingGraphContainer
    };

    return this;
};

ClientGame.prototype.start = function() {
    if (!this.connect()) return false;

    if (this._interval == undefined) {
        this._interval = setInterval($.proxy(this.run, this), 1000 / this.fps)
    }

    return this._interval != undefined;
};

ClientGame.prototype.run = function() {
    if (this._lastEmittedInput == this._world.getStep()) {
        this._lastEmittedInput = this._world.getStep() + 1;
        this._socket.emit('input', {step: this._lastEmittedInput});
    }
    this.updateGame();
    this.updateUi();
};

ClientGame.prototype.updateGame = function() {
    if (this._world) {
        this.tee = this._world.getStep() / 10.0;
        //this._world.tick();
    }

};

ClientGame.prototype.updateUi = function() {
    this.setDisplayedPing();
};

ClientGame.prototype.displayPingGraph = function(show) {
    this._displayPingGraph = show;
};


/**************************************************
 * Network Stuff
 **************************************************/
ClientGame.prototype.connect = function() {
    if (this._socket) return false;

    this._socket = io.connect(this.server);
    this._socket.on("responder", $.proxy(this.onResponder, this));
    this._socket.on("pong", $.proxy(this.onPong, this));
    // this._socket.on("tee", $.proxy(this.onTee, this));
    this._socket.on("worldState", $.proxy(this.onWorldState, this));
    this._socket.on('frame', $.proxy(this.onFrame, this));

    return true;
};


ClientGame.prototype.onFrame = function(data) {
    this._world.tick();
};

ClientGame.prototype.onResponder = function(data) {
    window.console.log(data);
};

ClientGame.prototype.onPong = function(data) {
    var now = microtime(true);
    var ping = now - data.data;

    this._ping.log(ping);
};

ClientGame.prototype.onTee = function(data) {
    this.tee = data;
};

ClientGame.prototype.onWorldState = function(data) {
    this._world = World.initAtStep(data.step, data.state);
    this._lastEmittedInput = data.step;
};


ClientGame.prototype.send = function(command, data) {
    this._socket.emit(command, data);
};

ClientGame.prototype.startGame = function() {
    this._socket.emit('start', {});
};

ClientGame.prototype.stopGame = function() {
    this._socket.emit('stop', {});
};

/**************************************************
 * UI
 **************************************************/

ClientGame.prototype.setDisplayedPing = function() {
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