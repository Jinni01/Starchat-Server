const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require("./db/db_connection");
const crypto = require('crypto');

module.exports = () => {

  passport.use(new LocalStrategy({
    usernameField: 'userID',
    passwordField: 'userPW',
    session: true,
    passReqToCallback: true,
  }, (req, id, pw, done) => {
    connection.query("select * from user where id = ?", [id], (err, result) => {
      console.log("result : ");
      console.log(result);
      if (err) {
        console.log(err);
        return done(false, null);
      } else {
        if (result.length === 0) {
          console.log("passport-login error => 존재하지 않는 ID");
          return done("존재하지 않는 아이디입니다", false);

        } else {
          crypto.pbkdf2(pw, result[0].salt, 52813, 64, "sha512", (err, key) => {
            console.log("incrypted-pw : " + result[0].pw);
            console.log("result-key : " + key.toString("base64"))
            if (!(result[0].pw === key.toString("base64"))) {
              console.log("passport-login error => 잘못된 PW");
              return done("잘못된 비밀번호입니다", false);

            } else {
              console.log("passport-login success");
              const user = result[0];
              delete user.pw;
              delete user.signdate;
              delete user.salt;

              return done(null, user);
            }
          });
        }
      }
    });
  }));

  passport.serializeUser((user, done) => {
    console.log("* serial *");
    console.log(user);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    console.log("* deserial *");
    console.log(user);
    done(null, user);
  });
};