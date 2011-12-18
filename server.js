var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')

app.listen(8080);

var G_WEBROOT = '/home/steven/socketplay/webroot/';

function handler (req, res) {
    var info = url.parse(req.url);

    if (info.pathname == '/') info.pathname = '/index.html';

    fs.realpath(G_WEBROOT + info.pathname, function(err, filePath) {
        if (!err) {
            console.log("handling " + filePath);
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading content');
                }

                res.writeHead(200);
                res.end(data);
            });
        } else {
            res.writeHead(404);
            return res.end('Not Found');
        }
    });

}

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

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('echo', function (data) { socket.emit('responder', data); });
  socket.on('ping', function (data) { 
    var time = microtime(true);
    socket.emit('pong', 
      { 'time': time, 'data': data } 
    ); 
  });
});

