'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const ObjectID = require('mongodb').ObjectID;

const passport = require('passport')
const session = require('express-session')
const app = express();

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
  const myDataBase = await client.db('database').collection('users')
  // routes
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true
    })
  })
  // middleware declarations 
  const auth = passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/' })
  const ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/')
  }
  //login
  app.route('/login').post(auth,(req, res) => {

  })
  // profile
  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/profile', { username: req.user.username })
  })
  app.route('/logout').get((req, res) => {
    req.logout()
    res.redirect('/')
  })
  // 404
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
  
  
passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
    done(null,doc)
  })
})
// Auth strategies
const LocalStrategy = require('passport-local')
passport.use(new LocalStrategy(
  function(username, password, done) {
    myDataBase.findOne({username: username}, function (err, user) {
      console.log(`user ${username} attempted to login`)
      if (err) { return done(err) }
      if (!user) { return done(null, false) }
      if (password !== user.password) { return done(null, false) }
      return done(null, user)
    })
  }
))


}).catch((e) => {
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: e,
      message: 'Unable to login'
    })
  })
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
