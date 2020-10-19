const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const uploader = require('../configs/cloudinary.config');
const User = require('../models/User.model');
const { ObjectId } = require('mongoose').Types;
const Post = require('../models/Post.model');

//Rota de signup:
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  const errors = {};

  if (!name || typeof name != 'string' || name.length > 20) {
    errors.name = 'O nome é obrigatório e deve ter no máximo 20 caracteres.';
  }

  if (!email || !email.match(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/)) {
    errors.email = 'O email é obrigatório e deve ser um endereço válido.';
  }

  if (
    !password ||
    !password.match(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
    )
  ) {
    errors.password =
      'A senha é obrigatória e deve ter pelo menos 8 caracteres, deve conter letra maiúscula, minúscula, um número e um caractere especial.';
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Hashed password -->', hashedPassword);

    const result = await User.create({
      name,
      email,
      passwordHash: hashedPassword
    });

    res.status(201).json({ user: result });
    console.log(result);
  } catch (err) {
    console.error(err);
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(500).json({ error: err.message });
    } else if (err.code === 11000) {
      res.status(500).json({
        error:
          'Email e senha devem ser únicos. Tanto senha quanto email já estão sendo usados.'
      });
    }
  }
});

//Rota de login:

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err || !user) {
        return next(info.message);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) {
          return next(error);
        }

        const body = {
          _id: user._id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          location: user.location,
          image: user.image
        };
        const token = jwt.sign({ user: body }, process.env.TOKEN_SIGN_SECRET);

        return res.json({ token, user: body });
      });
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
});

//Rota privada de usurário:

router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.json({
      user: req.user,
      token: req.query.secret_token
    });
  }
);

router.get(
  '/profile-edit',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.json({
      user: req.user,
      token: req.query.secret_token
    });
  }
);

//Rota de edit:

router.patch(
  '/profile/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await User.findOneAndUpdate({ _id: id }, req.body, {
        new: true
      });

      console.log(result);

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
);

//Rota de upload (foto do perfil):

router.post('/photo-upload', uploader.single('attachment'), (req, res) => {
  if (!req.file) {
    return res.status(500).json({ message: 'Nenhum arquivo carregado!' });
  }

  return res.status(200).json({ attachmentUrl: req.file.secure_url });
});

//Rota de delete:

router.delete(
  '/profile/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      //findOne no req.params, buscar user.posts, popular array com os posts e fazer solicitação do post.deleteMany
      const user = await User.findOne({ _id: ObjectId(id) });
      const posts = user.posts;
      const postResult = await Post.deleteMany({
        _id: posts
      });
      // console.log('TESTE PARAMS', result);
      const result = await User.deleteOne({ _id: ObjectId(id) });

      console.log(result);

      return res.status(200).json({});
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
);

module.exports = router;
