require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Configura o app para entender requisições com tipo de corpo JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: process.env.REACT_APP_URL }));

const authRouter = require('./routes/auth.routes');
const postRouter = require('./routes/post.routes');
const commentRouter = require('./routes/comment.routes');
const path = require('path');

require('./configs/db.config');

require('./configs/passport.config')(app);

app.use('/api', authRouter);
app.use('/api', postRouter);
app.use('/api', commentRouter);

const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));

app.get('*', (req, res, next) => {
  const hostUrl = req.originalUrl;
  if (!hostUrl.includes('/api')) {
    console.log(hostUrl);
    return res.sendFile(path.join(publicPath, 'index.html'));
  }
  return next();
});

app.listen(process.env.PORT, () =>
  console.log(`running at port ${process.env.PORT}`)
);
