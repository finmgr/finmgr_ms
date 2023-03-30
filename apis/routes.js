'use strict';

var expense = require('./expense');
//var report = require('./reports')

module.exports = function(app) {

  

    app.route('/expense').get(expense.all)
    app.route('/expense').post(expense.add)
    app.route("/category").get(expense.category)
    app.route("/expense/:id").delete(expense.delete)
    app.route("/expense/:id").put(expense.update)
    app.route("/report/:id").get(expense.report)
    app.route("/register").post(expense.registerUser)
    app.route("/login").post(expense.logUserIn)
    app.route("/expense/:sdate/:edate").get(expense.periodTransaction)
    //app.route('/expense/:id').get(expense.getById)
    

};