const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require("./db/db_connection");
const crypto = require('crypto');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  passport.use(new LocalStrategy({
    usernameField: 'userNickname',
    passwordField: 'userCode',
    session: true,
    passReqToCallback: false,
  }, (nickname, code, done) => {
    connection.query("select * from user where nickname = ?", [nickname], (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return done(false, null);
      } else {
        if (result.length === 0) {
          console.log("passport-login error => 존재하지 않는 유저");
          return done(null, false);

        } else {
          crypto.pbkdf2(nickname, result[0].salt, 52813, 64, "sha512", (err, key) => {
            console.log("code : " + code);
            console.log("key : " + key.toString("base64"))
            if (!(code === key.toString("base64"))) {
              console.log("passport-login error => 잘못된 유저 코드");
              return done(null, false);

            } else {
              console.log("passport-login success");
              const user = result[0];
              delete user.signdate;
              delete user.salt;
              return done(null, user);
            }
          });
        }
      }
    });
  }));
};