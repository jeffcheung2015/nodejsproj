var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");

//default script
var db = require('./db');
var userAuth = require("./userAuth");

var app = express();

//define the view engine
app.use(express.static(__dirname + '/views'));
// for parsing application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true })); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
/*
var consol = function(req, res, next){
	console.log('xxx');
	next();
}
app.use(consol);
*/

userAuth.userUseGetPost(app);

//error-handling middleware functions,invoked by any function calling next(err)
//it should be defined after other app.use
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.get('/', function(req, res){
	res.render('index', {
		user: req.user
	});
});

app.get("/contact", function(req,res){

	res.render('contact');

});

app.get("/profile", function(req, res){
	res.render('profile');
});

app.get('/category/:id' , function(req, res){
	console.log(req.params.id);
});

app.listen('80');

