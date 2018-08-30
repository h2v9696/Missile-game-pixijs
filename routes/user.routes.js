module.exports = (app) => {
    const users = require('../controllers/user.controller.js');

    // Create a new User
    app.post('/users', users.create);

    // Retrieve all Users
    app.get('/users', users.findAll);

    // Retrieve a single with id
    app.get('/users/:userId', users.findOne);

    // Update with id
    app.put('/users/:userId', users.update);

    // Delete with id
    app.delete('/users/:userId', users.delete);
}
