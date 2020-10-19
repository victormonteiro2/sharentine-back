const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const User = require('../models/User.model');

module.exports = function (app) {
  // Inicializa o passport
  app.use(passport.initialize());

  // Gravar um usuario a partir do token
  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });

  // Buscar um usuario a partir do token
  passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id })
      .then((user) => cb(null, user))
      .catch((err) => cb(err));
  });

  // Configurando passport para usar a estrategia local
  passport.use(
    new LocalStrategy(
      // Nomes dos campos de usuario e senha (no req.body)
      {
        usernameField: 'email', // by default
        passwordField: 'password' // by default
      },
      // funcao callback que tenta fazer o login e retorna a mensagem de erro ou o objeto do usuario encontrado
      (username, password, done) => {
        // Pesquisar usuario que esta logando no banco
        User.findOne({ email: username })
          .then((user) => {
            // Se o usuario nao existir, retorne erro
            if (!user) {
              return done(null, false, {
                message: 'Incorrect username or password'
              });
            }

            // Se a senha da tentativa de login nao bater com a armazenada no banco, retorne erro
            if (!bcrypt.compareSync(password, user.passwordHash)) {
              return done(null, false, {
                message: 'Incorrect username or password'
              });
            }

            // Caso contrario, retorne o objeto de usuario
            done(null, user);
          })
          .catch((err) => {
            console.error(err);
            return done(err);
          });
      }
    )
  );

  passport.use(
    new JWTstrategy(
      {
        secretOrKey: process.env.TOKEN_SIGN_SECRET,
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
};
