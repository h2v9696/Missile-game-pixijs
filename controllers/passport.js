var passport = require('passport')

exports.auth_FB = passport.authenticate('facebook');

exports.FB_callback = function(req, res, next){
  passport.authenticate('facebook', function(err, user, info){
    if (err) return next(err);
    if (!user) return res.redirect('/');
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  }) (req, res, next);
}

exports.auth_Tw = passport.authenticate('twitter');

exports.Tw_callback = function(req, res, next){
  passport.authenticate('twitter', function(err, user, info){
    if (err) return next(err);
    if (!user) return res.redirect('/');
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  }) (req, res, next);
}

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
}
