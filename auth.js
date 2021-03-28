const passport = require('passport')
const LocalStrategy = require('passport-local')
const GitHubStrategy = require('passport-github')
const bcrypt = require('bcrypt')
const ObjectID = require('mongodb').ObjectID

module.exports = function (app, myDataBase) {

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })
  
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null,doc)
    })
  })
  // Auth strategies
  

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
  passport.use(new LocalStrategy(
    function(username, password, done) {
      myDataBase.findOne({username: username}, function (err, user) {
        console.log(`user ${username} attempted to login`)
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        if (!bcrypt.compareSync(password, user.password)) { return done(null, false) }
        return done(null, user)
      })
    }
  ))

}