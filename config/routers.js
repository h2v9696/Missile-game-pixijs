var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/users')
var passport = require('passport')
var ejs = require('ejs')
var ejsLint = require('ejs-lint');

router.get('/', function(req, res) {
  res.render('index', { user: req.user })
})

router.get('/users', user_controller.index_users)

// router.get('/', function(req, res){
//   res.render(ejsLint('index', { user: req.user }));
// });

//Passport Router
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
  function(req, res, next){
  passport.authenticate('facebook', function(err, user, info){
    if(err){return next(err);}
    if(!user){return res.redirect('/');}
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  }) (req, res, next);
});
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

module.exports = router;
