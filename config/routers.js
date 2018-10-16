var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/users')
var passport = require('passport')

router.get('/', function(req, res) {
  res.render('index', { user: req.user })
})

router.get('/users', user_controller.index_users)

router.get('/', function(req, res){
  res.render('index', { user: req.user });
});

//Passport Router
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
     successRedirect : '/',
     failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/');
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
