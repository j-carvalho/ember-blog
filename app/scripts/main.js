/* globals jQuery, Ember */
'use strict';
(function(window, document, $, Ember, undefined){

    var App = Ember.Application.create({
        LOG_TRANSITIONS: true
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
        model: function(params){
            return App.Post.find(params.post_id);
        }
    });

    //App.PostsController = Ember.ArrayController.extend();

    /* --------- Models ---------- */
    App.Post = Ember.Object.extend({});

    App.Post.reopenClass({
        findAll: function(){
            var arr = [];

            $.ajax({
                type: 'GET',
                url: 'http://localhost:8888/ember/api/posts',
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
            return $.ajax({
                type: 'GET',
                url: 'http://localhost:8888/ember/api/posts/' + id,
                dataType: 'json'
            }).then(function(data){

                return App.Post.create(data);

            }, function(err){
                console.log(err);
            });
        }
    });


    window.App = App;

}(window, document, jQuery, Ember));