var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var join = require('path').join;
var fs = require('fs');

server.listen(80);

var pp = join(__dirname, '/page/');
app.set('views', pp);
app.set('view engine', 'jade');

app.use('/js', express.static('js'));
app.use('/src', express.static('src'));
app.use(express.static('page'));

// 读取页面结构
var examples = fs.readdirSync(pp).filter(function(file) {
    return fs.statSync(pp + '/' + file).isDirectory();
});

// 渲染页面结构
app.get('/', function(req, res) {
    res.render('list', { examples: examples });
});

// 
app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});
