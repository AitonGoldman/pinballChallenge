var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
require('./models/ChallengeUsers');
var secrets = require('./secrets/secrets');
//console.log(process.env.CHALLENGE_DEV + " is dev status")

var configDB = require('./config/database.js');
//mongoose.connect('mongodb://127.0.0.1/pplChallenge');
mongoose.connect(configDB.url);

var session      = require('express-session');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');


//var users = require('./routes/users');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({ secret: secrets.cookie_secret , cookie: { httpOnly: false , maxAge: 18000000}})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/passport')(passport);


////var routes = require('./routes/index')

var ChallengeUser = mongoose.model('ChallengeUser');
var auth = function(req, res, next){
    if (!req.isAthenticated()){
	res.send(401);
    } else {
	next()
    }
}

// app.get('/challengeUser_secure', auth, function(req, res, next) {
//     ChallengeUser.find(function(err, users){
// 	if(err){ return next(err); }
// 	res.json(users);
//     });
// });

var routes = require('./routes/index')(app,passport,secrets);

app.use('/', routes);


//require('./routes/passportRoutes.js')(app, passport);

////app.get('/admin_secure', requireAuth);

function requireAuth(req, res, next){

    // check if the user is logged in
    if(!req.isAuthenticated()){
	req.session.messages = "You need to login to view this page";
	return res.status(401).send('pork chops');
    } else {
	next({status:'200'});
    }
}

//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers


if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
