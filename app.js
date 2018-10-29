const express = require('express')
  , app = express()
  , port = process.env.PORT || 3000
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , config = require('./config/config')
  // , https = require('https')
  , fs = require('fs')
  , server = require("http").Server(app)
  , io = require("socket.io").listen(server)
var user_controller = require('./controllers/users.js')

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// Use the FacebookStrategy within Passport.
// Need split into mvc
passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url,
    profileFields: ['id', 'displayName']
  },
  user_controller.loginUser
));
// Use the TwitterStrategy within Passport.

passport.use(new TwitterStrategy({
    consumerKey: config.twitter_api_key,
    consumerSecret:config.twitter_api_secret ,
    callbackURL: config.twitter_callback_url,
    profileFields: ['id', 'displayName']
  },
  user_controller.loginUserTw
));
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'sskey', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./config/routers.js'))
app.use(express.static('.'));
// app.listen(port, function() {
//   console.log('Listening on port ' + port)
// });
server.listen(port);
io.on("connection", function(socket){
  socket.on("disconnect", function(){
    console.log("Disconnected");
  });

  socket.on("Save-point", user_controller.updatePoint);
});

// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app)
// .listen(3000, function () {
//   console.log('Example app listening on port 3000! Go to https://localhost:3000/')
// })

