/**
 * User: steven
 * Date: 18/12/11
 * Time: 16:44
 */

var PingAverager = function () {
    this._limit = 10;
    this._counts = [];
    for (var i = 0; i < this._limit; i++) this._counts.push(0);
    this._running = 0;
    this._offset = 0;

    this._pingLog = [];
    this._averageLog = [];
    this._longLogLength = 100;
    this._logPos = 0;

    return this;
};

PingAverager.prototype.log = function(ping) {
    this._running -= this._counts[this._offset];
    this._counts[this._offset] = ping;
    this._offset = (this._offset + 1) % this._limit;
    this._running += ping;

    if (this._pingLog.length == this._longLogLength) {
        this._pingLog.remove(0);
        this._averageLog.remove(0);
    }

    this._pingLog.push([    this._logPos, ping ]);
    this._averageLog.push([ this._logPos, this._running / this._limit ]);
    this._logPos++;
};

PingAverager.prototype.get = function() {
    if (this._counts.length == 0) return 0;
    return this._running / this._counts.length;
};

PingAverager.prototype.getPingLog = function() {
    return [ this._pingLog, this._averageLog ];
};
