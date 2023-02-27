'use strict';

var expense = require('./expense');
//var report = require('./reports')

module.exports = function(app) {

  

    app.route('/expense').get(expense.all)
    app.route('/expense').post(expense.add)
    //app.route('/expense/:id').get(expense.getById)
    

};