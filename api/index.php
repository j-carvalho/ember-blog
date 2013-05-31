<?php

/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim(array(
    'mode' => 'development',
    'debug' => true
));

$res = $app->response();
$res->header('Access-Control-Allow-Origin', '*');
$res->header("Content-Type: application/json");
$res->header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE, OPTIONS");

$app->get('/posts', 'getAllPosts');
$app->get('/posts/:id', 'getPost');
$app->post('/posts', 'createPost');
$app->put('/posts/:id', 'updatePost');
$app->delete('/posts/:id', 'deletePost');

$app->run();

function getAllPosts() {
    $sql = "SELECT * FROM posts ORDER BY created_at DESC";
    try {
        $db = getConnection();
        $stmt = $db->query($sql);
        $posts = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($posts);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function getPost($id) {
    $sql = "SELECT * FROM posts WHERE id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $post = $stmt->fetchObject();
        $db = null;
        echo json_encode($post);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function createPost() {
    $request = Slim::getInstance()->request();
    $post = json_decode($request->getBody());
    $sql = "INSERT INTO posts (tile, content, created_at, updated_at) VALUES (:title, :content, :created_at, :updated_at)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("tile", $post->tile);
        $stmt->bindParam("content", $post->content);
        $stmt->bindParam("created_at", date('Y/m/d H:i:s'));
        $stmt->bindParam("updated_at", date('Y/m/d H:i:s'));
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updatePost($id) {
    $request = Slim::getInstance()->request();
    $body = $request->getBody();
    $post = json_decode($body);
    $sql = "UPDATE posts SET title=:title, content=:content, updated_at=:updated_at
            WHERE id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("title", $post->title);
        $stmt->bindParam("content", $post->content);
        $stmt->bindParam("updated_at", date('Y/m/d H:i:s'));
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deletePost($id) {
    $sql = "DELETE FROM posts WHERE id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function getConnection() {
    $dbhost="localhost";
    $dbuser="root";
    $dbpass="root";
    $dbname="ember-blog";
    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}

?>
