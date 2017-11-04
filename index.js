var port = process.env.PORT || 8080;
var dbURI = "mongodb://localhost:27017/local";

var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Handlebars = require('handlebars');
var Fiber = require('fibers');
var Future = require('fibers/future');

//var extend = require('extend');
//var moment = require('moment');
var fs = require('fs');

var io = require('socket.io')(server);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// ------------------------------ Mongoose ------------------------------ //

mongoose.Promise = global.Promise;

mongoose.connect(dbURI, {
	useMongoClient: true,
});
mongoose.connection.on('error', function(err) {
	console.log('mongoose connection error: ' + err);
});

// when node closes, close connection
process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		process.exit(0);
	});
});



var dbs = require(__dirname + '/models');
var Message = dbs.Message;

// ------------------------------ Routing ------------------------------ //


app.get('/', function(req, res) {
	res.sendFile( __dirname + '/client/views/index.html');
});

app.post('/create-message', function(req, res) {
	var course = req.body.course;
	var message = req.body.message;
	var newMessage = new Message({
		body: Handlebars.Utils.escapeExpression(message),
		course: course == 'cs1' ? 'cs1' : 'cs2',
		created: new Date(),
	});
	
	newMessage.save(function(err) {
		if (err) {
			res.json({error: err});
		} else {
			io.emit('refresh', true);
			res.redirect('/');
		}
	});
});

io.on('connection', function(socket) {
	
	socket.on('get/messages', function(callback) {
		Fiber(function() {
			var response = {};
			
			var cs1Fut = new Future();
			Message.find({
				course: 'cs1',
			})
			.sort({created: -1})
			.limit(20).exec(function(err, messages) {
				cs1Fut.return(messages);
			});
			response.cs1 = cs1Fut.wait();
			
			var cs2Fut = new Future();
			Message.find({
				course: 'cs2',
			})
			.sort({created: -1})
			.limit(20).exec(function(err, messages) {
				cs2Fut.return(messages);
			});
			response.cs2 = cs2Fut.wait();
			
			callback(response);
		}).run();
	});
	
	
});



// ---------------------------------------- start -------------------------------- //

server.listen(port, function() {
	console.log('Server is listening on port ' + port);
});
