'use strict';

module.exports = expenseRoutes;

function expenseRoutes(app) {
  app.get('/api/employee', require('./getS.js'));
  app.post('/api/employee', require('./post.js'));
}