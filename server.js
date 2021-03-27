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
  const myDatabase = await client.db('FCC_TESTS').collection('users')
  // routes
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: 'Connected to the DB',
      message: 'Please login'
    })
  })
  

passport.serializeUser((user, done) => {
  done(null, user._id)
})

console.log(passport.serializeUser((user, done) => {
  done(null,user._id)
}))

passport.deserializeUser((id, done) => {
  myDatabase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
    done(null,doc)
  })
})

}).catch(e => {
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
