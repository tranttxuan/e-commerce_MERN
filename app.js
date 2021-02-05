require("dotenv").config();
require("./configs/dbConnnection");

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");


// Middlewares 
// ADD CORS:
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// SESSION
app.use(
     session({
          store: new MongoStore({
               mongooseConnection: mongoose.connection,
               //   ttl: 24 * 60 * 60,
          }),
          secret: process.env.SESSION_SECRET,
          resave: true,
          saveUninitialized: false,
          cookie: {
               maxAge: 1000 * 60 * 60 * 24 * 365
          },
     })
);

//Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.get('/api/config/paypal', (req, res) =>{
     res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
})

if (process.env.NODE_ENV === "production") {
     app.use("*", (req, res, next) => {
     // If no routes match, send them the React HTML.
     res.sendFile(__dirname + "/public/index.html");
     });
     }

module.exports = app;
