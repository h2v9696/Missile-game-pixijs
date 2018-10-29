const connection = require('../config/mysql_db')

exports.index = function() {
}

exports.create = function(user, callback) {
  connection.query('INSERT INTO users SET ?', user, function (error, results, fields) {
    if (error)
      callback(null);

    callback(user);
  });
}

exports.findByID = function(profile, callback) {
  console.log(profile.id);

  connection.query('SELECT * FROM users WHERE id = ?', profile.id, function (error, results, fields) {
    if (error) {
      console.log("DB error ocurred", error);
      callback(null);
    }
    if (results.length > 0) {
      console.log(JSON.parse(JSON.stringify(results))[0]);

      callback(JSON.parse(JSON.stringify(results))[0]);
    }
    callback(null)
  });
}

exports.update = function(profile, callback) {
  connection.query('UPDATE users SET point = ? WHERE id = ? ', [profile.point, profile.id], function(error, results, fields){
    if (error) {
      console.log("Update error ocurred", error);
      callback(null);
    }
    callback(profile)
  });
}
