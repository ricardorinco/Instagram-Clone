var express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb');


var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

module.exports = app;