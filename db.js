const sqlite3 = require('sqlite3')
          , db = new sqlite3.Database('users.db')

db.serialize(() => {
  // create a new database table:
  db.run("CREATE TABLE users (name TEXT, email TEXT, point INTEGER)");

  // insert 3 rows of data:
  db.run("INSERT INTO users VALUES ('Philip', 'professor', '500')");
  db.run("INSERT INTO users VALUES ('John', 'student', '533')");
  db.run("INSERT INTO users VALUES ('Carol', 'engineer', '324')");

  console.log('Successfully created the users table in users.db');
});

db.close();
