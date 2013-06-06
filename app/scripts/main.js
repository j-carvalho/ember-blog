/* globals jQuery, Ember */
'use strict';
(function(window, document, $, Ember, undefined){

    var App = Ember.Application.createWithMixins({
        LOG_TRANSITIONS: true,
        ajax: function(){
            var _this = this,
                url = arguments[0],
                args = arguments[1];

            return Ember.Deferred.promise(function(promise){
                args.success = function(xhr){
                    Ember.run(promise, promise.resolve, xhr);
                };

                args.error = function(xhr){
                    promise.reject(xhr);
                };

                $.ajax(_this.get('apiURL') + url, args);
            });
        },
        apiURL: 'http://localhost:3001/'
    });

    // Router
    App.Router.map(function(){

        // posts route
        this.resource('posts');

        // single post route
        this.resource('post', {path: '/post/:post_id'});

        // about route
        this.resource('about');
    });

    // Posts
    App.PostsRoute = Ember.Route.extend({
        model: function(){
            return App.Post.findAll();
        }
    });

    App.PostRoute = Ember.Route.extend({
        setupController: function(controller, model){
            this._super(controller, model);
            model.set('messages', model.messages || App.Message.findAll(model.id));
            this.controllerFor('messages').set('model', model.messages);
            this.controllerFor('message').set('model', App.Message.create({post_id: model.id}));
            //this.controllerFor('message').set('model', App.Message.create({post_id: model.id}));
        }//,
        // model: function(params){
        //     return App.Post.find(params.post_id);
        // }
    });

    App.MessageController = Ember.ObjectController.extend({
        needs: ['messages'],
        saveMessage: function(message){
            var _this = this;
            message.save().then(function(data){

                _this.get('controllers.messages').pushObject(App.Message.create(data));

                _this.set('model', App.Message.create({
                    post_id: data.post_id
                }));

            }, function(err){
                console.log(err);
            });
        }
    });

    App.MessagesController = Ember.ArrayController.extend({
        sortProperties: ['created_at'],
        sortAscending: false,
        editMessage: function(message){
            message.set('edit', !message.get('edit'));
            //this.get('controllers.message').set('model', message);
        },
        updateMessage: function(message){
            message.update();
        },
        deleteMessage: function(message){
            var _this = this;

            message.delete().then(function(data){
                _this.get('content').removeObject(message);
            }, function(err){
                console.log(err);
            });

        }
    });

    //App.PostsController = Ember.ArrayController.extend();

    /* --------- Models ---------- */

    App.Posts = Ember.Object.extend({});

    App.Post = Ember.Object.extend({
        loadMessages: function(){
            var _this = this,
                post_id = _this.get('id');

            App.ajax('posts/' + post_id + '/messages', {
                type: 'GET',
                dataType: 'json'
            }).then(function(data){

                var messages = [];

                $.each(data, function(index, message){
                    messages.addObject(App.Message.create(message));
                });

                _this.set('messages', messages);
            });
        }
    });

    App.Post.reopenClass({
        findAll: function(){

            var arr = [];

            App.ajax('posts', {
                type: 'GET',
                dataType: 'json'
            }).then(function(data){

                $.each(data, function(index, item){
                    arr.addObject(App.Post.create(item));
                });

                return arr;
            }, function(err){
                console.log(err);
            });

            return arr;
        },
        find: function(id){

            return App.ajax('posts/' + id, {
                type: 'GET',
                dataType: 'json'
            }).then(function(data){

                data.messages = $.map(data.messages, function(item, index){
                    return App.Message.create(item);
                });

                return App.Post.create(data);

            }, function(err){
                console.log(err);
            });
        }
    });

    App.Message = Ember.Object.extend({
        text: null,
        edit: false,
        editable: function(){
            return this.get('edit');
        }.property('edit'),
        save: function(){
            var post_id = this.get('post_id'),
                id = this.get('id'),
                url = id ? 'posts/' + post_id + '/messages/' + id  : 'posts/' + post_id + '/messages';
            return App.ajax(url, {
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(this),
                contentType: 'application/json'
            });
        },
        update: function(){
            var _this = this,
                post_id = _this.get('post_id'),
                id = _this.get('id'),
                url = 'posts/' + post_id + '/messages/' + id;

            App.ajax(url, {
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(_this),
                contentType: 'application/json'
            }).then(function(message){

                _this.setProperties(message);
                _this.set('edit', false);

            }, function(err){

                console.log(err);

            });

        },
        delete: function(){
            var _this = this,
                post_id = _this.get('post_id'),
                id = _this.get('id'),
                url = 'posts/' + post_id + '/messages/' + id;

            _this.set('loading', true);

            return App.ajax(url,
                {
                    type: 'DELETE',
                    dataType: 'json'
                });
        }
    });

    App.Message.reopenClass({
        findAll: function(post_id){
            var messages = [];

            App.ajax('posts/' + post_id + '/messages', {
                type: 'GET',
                dataType: 'json'
            }).then(function(data){

                $.each(data, function(index, message){
                    messages.addObject(App.Message.create(message));
                });

                return messages;
            });

            return messages;
        }
    });


    window.App = App;

}(window, document, jQuery, Ember));