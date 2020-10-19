require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// Configura o app para entender requisições com tipo de corpo JSON
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const authRouter = require('./routes/auth.routes');
const postRouter = require('./routes/post.routes');
const commentRouter = require('./routes/comment.routes');

require('./configs/db.config');

require('./configs/passport.config')(app);

app.use('/api', authRouter);
app.use('/api', postRouter);
app.use('/api', commentRouter);

app.use('/api', require('./routes/file-upload-routes'));

app.listen(5000, () => console.log('running at port 5000'));
