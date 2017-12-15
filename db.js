
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
district varchar(16) not null, createAt date not null);
*/

conn.connect(function(err) {
	if (err) throw err;
	console.log("database Connected!");
});

module.exports={
	conn : conn,
	insertUserRow : function(name, email, birth, uname, pw, phoneno,district){
		bcrypt.hash(pw, 10, function(err, hash) {
		  // Store hash in database
		  var sql = "Insert into usertb(name, email, birthdate, username, pwhash, "+
			"phonenumber, district, createAt) values(?, ?, ?, ?, ?, ?, ?, CURDATE())";
			conn.query(sql,[name, email, birth, uname, hash, phoneno, district], 
				function (err, result) {
					if(err) console.log('sql insert error:'+err);
				});
		});
	}
};

