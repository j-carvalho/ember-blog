'use strict';

var express = require('express'),
http = require('http'),
path = require('path'),
posts = require('./routes/posts');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3001);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        if( req.method.toLowerCase() === 'options' ) {
            res.send( 200 );
        }
        else {
            next();
        }
    });
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/posts', posts.getAllPosts);
app.get('/posts/:id', posts.getPost);
app.post('/posts', posts.createPost);
app.put('/posts/:id', posts.updatePost);
app.delete('/posts/:id', posts.deletePost);

app.get('/posts/:post_id/messages', posts.getAllMessages);
app.get('/posts/:post_id/messages/:id', posts.getMessage);
app.post('/posts/:post_id/messages', posts.createMessage);
app.put('/posts/:post_id/messages/:id', posts.updateMessage);
app.delete('/posts/:post_id/messages/:id', posts.deleteMessage);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});