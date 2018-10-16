var User = require('../models/user')

exports.index_users = function(req, res) {
  res.render('users', { title: 'Users', users: User.index() })
}
