var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var flash = require('connect-flash');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var db = require("./db");


//passport.use(<optional name of the strategy{if not set default is 'local'}>,
// localstrategy)
//passport use config the local strategy
passport.use('login', new LocalStrategy({
	//for extracting username and password from post request and put it in
	//the next callback
	usernameField : 'Username', 
	passwordField : 'Password',
},
function(username, password, done) {
	var sql = "Select * from usertb where username = ?";
	db.conn.query(sql, [username], function(err, user){
		if (err) { console.log("sql select error:"+err); return done(err); }
		if(user.length > 0){			
			bcrypt.compare(password, user[0].pwhash, function(err, isValid){
				if(isValid){
					return done(null, user[0]);
				}else{        		
					return done(null, false, { message: 'Incorrect password.' });
				}
			});
		}
		else{
			return done(null, false, { message: 'Incorrect username.' });
		}
	});
}
));

//se dese
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	var sql = "Select * from usertb where id = ?";
	db.conn.query(sql, [id], function(err, result){
		if (err) throw err;
		done(err, result[0]);
	})
});



module.exports = {
	//used as callback only
	isLoggedIn : function(req, res, next) {
	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())	return next();
	    // if they aren't redirect them to the home page
	    res.redirect('/');
	},
	
	isLoggedOut : function(req, res, next) {
	    // if user is authenticated in the session, carry on 
	    if (!req.isAuthenticated())	return next();
	    // if they aren't redirect them to the home page
	    res.redirect('/profile');
	},

	userUseGetPost : function(app, isLoggedOut){

		//express.session middleware is used to retrieve user session from a datastore
		app.use(session({ store: new RedisStore({
			host:'127.0.0.1',
			port: '6379',
			prefix:'sess'
		}), 
		secret: 'SEKR37' ,
		resave: false,
		saveUninitialized: false,
			//preventing XSS by setting secure true( but currently not using
			//HTMLS, redis server wouldn't work as expected to store session)
			cookie: {  httpOnly: true 	 } 
		}));

		app.use(flash());
		//passport.session middleware is to deserialize user object 
		//from session using passport.serializeUser function
		app.use(passport.initialize());
		app.use(passport.session()); //has to be used after express session

		//login
		app.get('/login', isLoggedOut, function(req, res){
			//req.flash("error") is a must in order to make the error msg appeared
			res.render('login', { message: req.flash("error")});
		});
		app.post('/login',passport.authenticate('login', {
		        successRedirect : '/', // redirect to the secure profile section
		        failureRedirect : '/login', // redirect back to the signup page if there is an error
		        failureFlash : true // allow flash messages
		    })
		);

		//register
		app.get('/register',  isLoggedOut, function(req, res){			
			//One time error msg 
			var errorMsg = req.session.error;
			delete req.session.error;
			res.render('register', { error: errorMsg });
		});
		app.post('/register', function(req,res){
			//validate user's input

			/*
			
			req.session.error = {
				name : (req.body.Name === "") ? "Name is empty" : "",
				email : (req.body.Email === "") ? "Email is empty" : "",
				password : (req.body.BirthDate === "") ? "Password is empty" : "",
				phoneno : (newPhoneno === "") ? "PhoneNumber is empty" : "",
				name : (newName === "") ? "Name is empty" : "",
				name : (newName === "") ? "Name is empty" : "",


			};
			*/

			db.insertUserRow(req, res, req.body.Name, req.body.Email, req.body.BirthDate
				, req.body.Username, req.body.Password, req.body.PhoneNumber
				, req.body.District);

			
		});	

		//logout
		app.get('/logout', function(req,res){
			req.logout();
			res.redirect('/');
		});
	}

}
