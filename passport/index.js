const passport = require('passport');
const localStrategy = require('./localStrategy');
const kakaoStrategy = require('./kakaoStrategy');
const User = require('../models/user');

passport.serializeUser((user, done) => {
  console.info('___passport.serializeUser()');
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.info('___passport.deserializeUser()');
  User.findOne({ where: { id } })
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

passport.use(localStrategy);
passport.use(kakaoStrategy);

module.exports = passport;
