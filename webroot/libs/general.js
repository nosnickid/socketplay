/**
 * User: steven
 * Date: 18/12/11
 * Time: 16:46
 */

function microtime (get_as_float) {
    // Returns either a string or a float containing the current time in seconds and microseconds
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/microtime
    // +   original by: Paulo Freitas
    // *     example 1: timeStamp = microtime(true);
    // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
    var now = new Date().getTime() / 1000;
    var s = parseInt(now, 10);

    return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};