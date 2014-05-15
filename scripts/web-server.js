var serverPort = 9000;
var express = require('express');
var app = express();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(allowCrossDomain);
app.use(express.static(__dirname + '/..'));

// Setting to allow SPA
app.all('/*', function(req, res) {
    res.sendfile('index.html', { root: __dirname+'/..' });
});

var server = require('http').createServer(app);
server.listen(serverPort);

console.log('App server started on port ' + serverPort);
console.log(' /                  - application root');