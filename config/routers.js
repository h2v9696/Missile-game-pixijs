var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/users')
var passport_controller = require('../controllers/passport')
var passport = require('passport')
var ejs = require('ejs')
var ejsLint = require('ejs-lint');

router.get('/', function(req, res) {
  res.render('index', { user: req.user })
})

router.get('/users', user_controller.index_users)

//Passport Router
router.get('/auth/facebook', passport_controller.auth_FB);
router.get('/auth/facebook/callback', passport_controller.FB_callback);
router.get('/auth/twitter', passport_controller.auth_Tw);
router.get('/auth/twitter/callback', passport_controller.Tw_callback);
router.get('/logout', passport_controller.logout);
module.exports = router;
