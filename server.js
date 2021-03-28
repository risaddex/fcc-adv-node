'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport')
const routes = require('./routes')
const auth = require('./auth');


const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// setting pug
app.set('view engine', 'pug')

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// setting passport and express-session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());
//connect to MongoDB
myDB(async client => {
  const myDataBase = await client.db('FCC_TESTS').collection('users')
  // index
  routes(app, myDataBase)
  auth(app, myDataBase)
  // tracking current users quantity
  let currentUsers = 0
  io.on('connection', (socket) => {
    ++currentUsers
    io.emit('user count', currentUsers)
    console.log('a user has connected')
  })
  
  

}).catch((e) => {
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: e,
      message: 'Unable to login'
    })    
  })
})


const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
