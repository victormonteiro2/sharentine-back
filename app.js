require('dotenv').config();
require('./configs/db.config');
require('./configs/passport.config')(app);

const express = require('express');
const cors = require('cors');
const app = express();
const authRouter = require('./routes/auth.routes');
const postRouter = require('./routes/post.routes');
const commentRouter = require('./routes/comment.routes');
const path = require('path');

// Configura o app para entender requisições com tipo de corpo JSON
app.use(express.json());
app.use(cors({ origin: process.env.CORS }));

app.use('/api', authRouter);
app.use('/api', postRouter);
app.use('/api', commentRouter);
app.use('/api', require('./routes/file-upload-routes'));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(process.env.PORT, () =>
  console.log(`running at port ${process.env.PORT}`)
);

app.use(express.static(path.join(__dirname, '/public')));
app.use((req, res, next) => {
  const hostUrl = req.get('host');
  if (hostUrl.includes('/api') === true) {
    return res.sendFile(__dirname + '/public/index.html');
  }
  return;
});
