var User = require('../models/user')

exports.index_users = function(req, res) {
  res.render('users', { title: 'Users', users: User.index() })
}

exports.loginUser = function(accessToken, refreshToken, profile, done) {
  User.findByID(profile, function(data) {
    if (data != null) {
      return done(null, data);
    } else {
      user = {
        "id": profile.id,
        "username": profile.displayName,
        "point": 1000
      }
      User.create(user, function(data) {
        if (data != null) {
          return done(null, data);
        }
      })
    }
  });
}

exports.updatePoint = function(data) {
  User.findByID(data, function(profile) {
    if (profile != null) {
      User.update(data, function(profile) {
        console.log(profile);
      });
    }
  });
}

