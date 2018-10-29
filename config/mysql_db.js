var mysql = require('mysql')
      , config = require('./config')

//Define MySQL parameter in Config.js file.
var connection = mysql.createConnection({
  host : config.host,
  user : config.username,
  password : config.password,
  database : config.database
});
//Connect to Database only if Config.js parameter is set.
if(config.use_database === 'true')
{
    connection.connect();
}

module.exports = connection
