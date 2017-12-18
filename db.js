
var mysql = require('mysql');

var bcrypt = require('bcrypt');

var passport = require('passport');

var conn = mysql.createConnection({
	host: '127.0.0.1',
	user: "root",
	password: "",
	database: "nodedb"
});

/*
Create table usertb (
id int(6) unsigned auto_increment primary key,
avatarAddr varchar(32),
name varchar(16) not null, email varchar(32) not null unique,
birthdate date not null, username varchar(16) not null unique,
pwhash varchar(72) not null,phonenumber int(8) not null, 
district varchar(16) not null, createAt date not null,
prefer);
*/

conn.connect(function(err) {
	if (err) throw err;
	console.log("database Connected!");
});

module.exports={
	conn : conn,
	insertUserRow : function(req,res, name, email, birth, uname, pw, phoneno,district){
		bcrypt.hash(pw, 10, function(err, hash) {
		  // Store hash in database
		  var sql = "Insert into usertb(name, email, birthdate, username, pwhash, "+
		  "phonenumber, district, createAt) values(?, ?, ?, ?, ?, ?, ?, CURDATE())";
		  conn.query(sql,[name, email, birth, uname, hash, phoneno, district], 
		  	function (err, result) {
		  		if(err) {
		  			console.log('sql insert error:'+err);
		  			req.session.error = "invlaid operation.";
		  			res.redirect("/register");
		  		}
		  		else{						
		  			res.redirect('/');
		  		}
		  	});
		});
	},

	updateUserRow : function(req, res, username, newName, newEmail, newBirthdate,
		oldpw, newpw, newPhoneno, newDistrict){
		if(oldpw === ""){ //without inputting original password is unpermitted
			req.session.error = {
				password : "Must be filled out for any update of user info."
			};
			res.redirect("/profile");
		}else{
			if(newpw === ""){
				conn.query(updateRowSql(newpw), [username], function(err, result){
					if(err) {
				  			console.log('sql insert error:'+err);
				  			req.session.error = "invlaid operation.";
				  			res.redirect("/profile");
				  		}
				});
			}
			else{
				bcrypt.hash(newpw, 10, function(err, hash){				
					conn.query(updateRowSql(hash), [username], function(err, result){
						if(err) {
				  			console.log('sql insert error:'+err);
				  			req.session.error = "invlaid operation.";
				  			res.redirect("/profile");
				  		}
					});
				});
			}
		}
	}

};

function updateRowSql(hash, newName, newEmail, newBirthdate, oldpw, newpw,
 newPhoneno, newDistrict){
	var nameStr = (newName !== "") ? "name = " + newName + ",": "",
	emailStr = (newEmail !== "") ? "email = " + newEmail + ",": "",
	birthStr = (newBirth !== "") ? "birthdate = " + newBirthdate + ",": "",
	pwStr = (hash !== "") ? "password = " + hash + ",": "",
	phoneNoStr = (newPhoneno !== "") ? "phoneno = " + newPhoneno + ",": "",
	districtStr = (newDistrict !== "") ? "district = " + newDistrict + ",": "";

	var sql = "Update usertb set " + nameStr + emailStr + birthStr +
					pwStr + phoneNoStr + districtStr + " where username = ?";

	return sql;
}