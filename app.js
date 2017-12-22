var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var multer  = require('multer');

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


var storage = multer.diskStorage({ //multers disk storage settings
	destination: function (req, file, cb) {
		cb(null, './uploads/')
	},
	filename: function (req, file, cb) {
		var datetimestamp = Date.now();
		cb(null, file.fieldname + '-' + datetimestamp + '.' +
			file.originalname.split('.')[file.originalname.split('.').length -1])
	}
});
var upload = multer({ //multer settings
	storage: storage
}).array('file');

/*
var consol = function(req, res, next){
	console.log('xxx');
	next();
}
app.use(consol);
*/

userAuth.userUseGetPost(app, userAuth.isLoggedOut);

//error-handling middleware functions,invoked by any function calling next(err)
//it should be defined after other app.use
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.get('/', function(req, res){
	res.render('index', { user: req.user });
});

//auth required
app.get("/contact", userAuth.isLoggedIn, function(req,res){	
	res.render('contact', { user: req.user });
});

app.get("/uploadItem", userAuth.isLoggedIn, function(req,res){	
	var msg = req.session.message;
	delete req.session.message;
	res.render('uploadItem', { message: msg, user: req.user });
});

app.get("/profile", userAuth.isLoggedIn, function(req, res){	
	//One time error msg 
	var errorMsg = req.session.error;
	delete req.session.error;
	//must delete the session variable before writing and sending the res
	res.render('profile', { error: errorMsg, user: req.user });
});

app.get("/category/:id", function(req, res){
	console.log(req.params.id);
});

app.get("/faq", function(req, res){
	res.render('faq');
});

app.post("/uploadItem", userAuth.isLoggedIn, function(req,res){
	upload(req,res,function(err){
		if(err){
			res.json({error_code:1,err_desc:err});
			return;
		}	
		req.session.message = "Successfully uploaded "+
		 req.files.length +" items.";
		res.redirect('uploadItem');	
	});

});

app.post("/accountSettings", userAuth.isLoggedIn, function(req,res){
	db.updateUserRow(req, res, req.user.username, req.body.Name, req.body.Email, req.body.BirthDate,
		req.body.OldPassword, req.body.NewPassword, req.body.PhoneNumber, 
		req.body.District);
});



app.listen('80');

