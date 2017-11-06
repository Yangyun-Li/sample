
// Everything that was in the file before goes here
var express = require('express');

app = express();

app.use(express.static('public')) // We will want this later
app.set('view engine', 'ejs')

app.get('/banned-words', function(req, res){
          res.render('banned-words', {'wordlist': ""})
    })
app.get('/', function(req, res){
            res.render('index', {'messages': ""})
    })


var port = process.env.PORT || 3000; // For when we deploy to Heroku

var server = app.listen(port)

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    socket.on('setUsername', function (data) {
        socket.username = data
    })
    socket.on('message', function (message) {
        var data = { 'message' : message, 'username': socket.username }
        socket.broadcast.emit('message', data);
    })
})
