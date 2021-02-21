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

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
// app.get('/api/config/paypal', (req, res) =>{
//      res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
// })

//Create HTTP server
const server = require("http").createServer(app);
//Create chat server
const users = [];
const io = require('socket.io')(server,
     {
          cors: {
               origin: process.env.FRONTEND_URL,
               methods: ["GET", "POST"],
               allowedHeaders: ["my-custom-header"],
               credentials: true
          }
     }
);

io.on('connection', (socket) => {
     console.log(socket.id, " - user: connected");
     socket.on('disconnect', () => {
          const user = users.find((x) => x.socketId === socket.id);
          if (user) {
               user.online = false;
               console.log('Offline', user.name);
               console.log(users);
               const admin = users.find((x) => x.isAdmin && x.online);
               if (admin) {
                    io.to(admin.socketId).emit('updateUser', user);
               }
          }
     });

     socket.on('onLogin', (user) => {
          const updatedUser = {
               ...user,
               online: true,
               socketId: socket.id,
               messages: [],
          };
          const existUser = users.find((x) => x._id === updatedUser._id);
          if (existUser) {
               existUser.socketId = socket.id;
               existUser.online = true;
          } else {
               users.push(updatedUser);
          }
          console.log('Online', user.name);
          console.log(users);
          const admin = users.find((x) => x.isAdmin && x.online);
          if (admin) {
               io.to(admin.socketId).emit('updateUser', updatedUser);
          }
          if (updatedUser.isAdmin) {
               io.to(updatedUser.socketId).emit('listUsers', users);
          }
     });

     socket.on('onUserSelected', (user) => {
          const admin = users.find((x) => x.isAdmin && x.online);
          if (admin) {
               const existUser = users.find((x) => x._id === user._id);
               io.to(admin.socketId).emit('selectUser', existUser);
          }
     });
     socket.on('onMessage', (message) => {
          if (message.isAdmin) {
               const user = users.find((x) => x._id === message._id && x.online);
               if (user) {
                    io.to(user.socketId).emit('message', message);
                    user.messages.push(message);
               }
          } else {
               const admin = users.find((x) => x.isAdmin && x.online);
               if (admin) {
                    io.to(admin.socketId).emit('message', message);
                    const user = users.find((x) => x._id === message._id && x.online);
                    user.messages.push(message);
               } else {
                    io.to(socket.id).emit('message', {
                         name: 'Admin',
                         body: 'Sorry. I am not online right now',
                    });
               }
          }
     });
});

if (process.env.NODE_ENV === "production") {
     app.use("*", (req, res, next) => {
          // If no routes match, send them the React HTML.
          res.sendFile(__dirname + "/public/index.html");
     });
}

module.exports = { app, server };
