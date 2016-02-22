/**
 * Module dependencies.
 */

// var join = require('path').join;
// var fs = require('fs');

// var app = require('express')();
// var server = require('http').Server(app);
// var io = require('socket.io')(server);


// deprecated express methods
// app.use(express.favicon());
// app.use(express.logger('dev'));

// app.set('views', __dirname);
// app.set('view engine', 'jade');
// app.enable('strict routing');

// load examples

// var examples = fs.readdirSync(__dirname).filter(function(file) {
//     return fs.statSync(__dirname + '/' + file).isDirectory();
// });

// // routes

// /**
//  * GET test libraries.
//  */

// app.get(/^\/(mocha|chai)\.(css|js)$/i, function(req, res) {
//     res.sendFile(join(__dirname, '../test/', req.params.join('.')));
// });

// /**
//  * GET list of examples.
//  */

// app.get('/', function(req, res) {
//     res.render('list', { examples: examples });
// });

// /**
//  * GET /js/* as a file if it exists.
//  */

// app.get('/js/:file(*)', function(req, res, next) {
//     var file = req.params.file;
//     if (!file) return next();
//     var path = join(__dirname, '../js/', file);
//     fs.stat(path, function(err, stat) {
//         if (err) return next();
//         res.sendFile(path);
//     });
// });

// /**
//  * GET /src/* as a file if it exists.
//  */

// app.get('/src/:file(*)', function(req, res, next) {
//     var file = req.params.file;
//     if (!file) return next();
//     var path = join(__dirname, '../src/', file);
//     fs.stat(path, function(err, stat) {
//         if (err) return next();
//         res.sendFile(path);
//     });
// });

// /**
//  * GET /:example -> /:example/
//  */

app.get('/:example', function(req, res) {
    res.redirect('/' + req.params.example + '/');
});

// /**
//  * GET /:example/* as a file if it exists.
//  */

// app.get('/:example/:file(*)', function(req, res, next) {
//     var name = req.params.example;
//     var file = req.params.file;
//     if (name !== 'socket.io') {
//         if (!file) return next();
//         var name = req.params.example;
//         var path = join(__dirname, name, file);
//         fs.stat(path, function(err, stat) {
//             if (err) return next();
//             res.sendFile(path);
//         });
//     }
// });

// /**
//  * GET /:example/* as index.html
//  */

// app.get('/:example/*', function(req, res, next) {
//     var name = req.params.example;
//     if (name !== 'js' && name !== 'src' && name !== 'socket.io')
//         res.sendFile(join(__dirname, name, 'index.html'));
//     // else return next();
// });

io.on('connection', function(socket) {
    console.log('socket connection');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});

app.listen(4000);
console.log('Example server listening on port 4000');
