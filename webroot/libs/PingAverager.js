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
    return this;
};

PingAverager.prototype.log = function(ping) {
    this._running -= this._counts[this._offset];
    this._counts[this._offset] = ping;
    this._offset = (this._offset + 1) % this._limit;
    this._running += ping;
};

PingAverager.prototype.get = function() {
    if (this._counts.length == 0) return 0;
    return this._running / this._counts.length;
};