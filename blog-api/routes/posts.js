'use strict';

var Sequelize = require('sequelize');

var sequelize = new Sequelize('ember-blog', 'root', 'root', {
    host: 'localhost',
    port: '8889',
    define: {
        underscored: true
    }
});

var Post = sequelize.define('Post', {
    title: { type : Sequelize.STRING(100), allowNull : false },
    text: { type : Sequelize.STRING(500), allowNull : false }
});

var Message = sequelize.define('Message', {
    text: { type : Sequelize.STRING(250), allowNull : false }
});

Post.hasMany(Message, {as: 'Messages'});

Message.belongsTo(Post, {foreignKey: 'post_id'});

Post.sync();
Message.sync();

exports.getAllPosts = function(req, res){
    Post.findAll( { raw : true } ).success(function(posts){
        res.contentType('application/json');
        res.send(JSON.stringify(posts));
        res.end();
    }).error(function(errors){
        throw errors;
    });
};

exports.getPost = function(req, res){
    Post.find({where: {id: req.params.id}, include: [{ model: Message, as: 'Messages'}], raw : true }).success(function(post){
        res.contentType('application/json');
        res.send(JSON.stringify(post));
        res.end();
    }).error(function(errors){
        throw errors;
    });
};

exports.createPost = function(req, res){
    Post.create(req.body).success(function(post){
        res.contentType('application/json');
        res.send(JSON.stringify(post));
        res.end();
    }).error(function(errors){
        throw errors;
    });
};

exports.updatePost = function(req, res){
    Post.find(req.params.id).success(function(post){
        post.updateAttributes(req.body).success(function(post){
            res.contentType('application/json');
            res.send(JSON.stringify(post));
            res.end();
        }).error(function(errors){
            throw errors;
        });
    }).error(function(errors){
        throw errors;
    });
};

exports.deletePost = function(req, res){
    Post.find(req.params.id).success(function(post){
        post.destroy().success(function(){
            res.contentType('application/json');
            res.send(JSON.stringify({ success : true}));
            res.end();
        }).error(function(errors){
            throw errors;
        });
    }).error(function(errors){
        throw errors;
    });
};

exports.getAllMessages = function(req, res){
    Message.findAll( { where : { post_id : req.params.post_id } ,  raw : true  } ).success(function(messages){

        setTimeout(function(){
            res.contentType('application/json');
            res.send(JSON.stringify(messages));
            res.end();
        }, 5000);

    }).error(function(errors){
        throw errors;
    });
};

exports.getMessage = function(req, res){
    Message.find( { where : { id : req.params.id } , raw : true  }).success(function(message){
        res.contentType('application/json');
        res.send(JSON.stringify(message));
        res.end();
    }).error(function(errors){
        throw errors;
    });
};

exports.createMessage = function(req, res){

    Post.find(req.params.post_id).success(function(post){

        Message.create(req.body).success(function(message){

            post.addMessage(message).success(function(message){

                res.contentType('application/json');
                res.send(JSON.stringify(message));
                res.end();

            }).error(function(errors){

                throw errors;

            });

        }).error(function(errors){

            throw errors;

        });

    }).error(function(errors){

        throw errors;

    });

};

exports.updateMessage = function(req, res){

    Message.find(req.params.id).success(function(message){

        message.updateAttributes(req.body).success(function(message){

            res.contentType('application/json');
            res.send(JSON.stringify(message));
            res.end();

        }).error(function(errors){
            throw errors;
        });

    }).error(function(errors){

        throw errors;

    });

};

exports.deleteMessage = function(req, res){
    Message.find(req.params.id).success(function(message){
        message.destroy().success(function(){
            setTimeout(function(){
                res.contentType('application/json');
                res.send(JSON.stringify({ success : true}));
                res.end();
            }, 5000);
        }).error(function(errors){
            throw errors;
        });
    }).error(function(errors){
        throw errors;
    });
};