var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var app = express(); 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));
var port =process.env.PORT || 3000; 
var routes = require('./apis/routes'); 
routes(app); 
app.listen(port,function(){ console.log('Server started on port: ' + port); });