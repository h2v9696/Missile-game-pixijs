const express = require('express')
  , app = express()
  , port = process.env.PORT || 3000
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , config = require('./config/config')
  , mysql = require('mysql')
  , https = require('https')
  , fs = require('fs')
var users = require('./models/user.js')

var connection = mysql.createConnection({
  host : config.host,
  user : config.username,
  password : config.password,
  database : config.database
});
//Connect to Database only if Config.js parameter is set.
if(config.use_database==='true')
{
    connection.connect();
}
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
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {

      connection.query('SELECT * FROM users WHERE id = ?', profile.id, function (error, results, fields) {
        if (error) {
          console.log("error ocurred",error);
          return done(err);
        }
        // console.log('The solution is: ', results);
        if (results.length >0) {
          // console.log('Success!')

          return done(null, JSON.parse(JSON.stringify(results))[0]);

        } else {
          user = {
            "id": profile.id,
            "username": profile.displayName,
            "point": 1000
          }
          connection.query('INSERT INTO users SET ?', user, function (error, results, fields) {
            if (error) {
              console.log("error ocurred", error);
            } else {
              return done(null, user);
            }
          });
        }
      });
      //Check whether the User exists or not using profile.id
      //Further DB code.
    });
  }
));

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./config/routers.js'))
app.use(express.static('.'));
app.listen(port, function() {
  console.log('Listening on port ' + port)
});
// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app)
// .listen(3000, function () {
//   console.log('Example app listening on port 3000! Go to https://localhost:3000/')
// })

