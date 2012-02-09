/**
 * (c) Steven Dickinson
 */

var World = function() {
    this._step = 0;

    return this;

};

World.initAtStep = function(step, data) {
    var result = new World();
    result._step = step;
    result._readState(data);
    return result;
};

World.prototype._readState = function(data) {
    // nothing to do??
};

World.prototype.getState = function() {
    return { step: this._step, state: {} };
};

World.prototype.getStep = function() {
    return this._step;
};

World.prototype.tick = function() {
    this._step++;
};


if (typeof exports !== 'undefined') exports.World = World;