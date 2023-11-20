const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const http = require('http')
const express = require('express')
const usersRouter = require('./routes/users/usersRouter');
const { globalErrHandler, notFound } = require('./middlewares/globalErrorHandler');
const categoryRouter = require('./routes/category/categoryRouter');
const postsRouter = require('./routes/post/postRouter');
const commentRouter = require('./routes/comment/comment');
const sendEmail = require('./utils/sendEmail');

//db connect(require is a function and we are calling that function which means immediately invoke function)
require('./config/database')()
sendEmail('uabishek6@gmail.com', '87347834')


//!server
const app = express();

//middlewares
app.use(express.json()); //pass incoming data

//! cors middlewares
app.use(cors())

// Routes
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/posts', postsRouter)
app.use('/api/v1/comments', commentRouter)


app.all('*', (req, res) => {
    res.status(404).send('Page not found');
});

//! Error middleware
app.use(globalErrHandler)

//? Not Found middleware
app.use(notFound)

const server = http.createServer(app)

//? start the server
const PORT = process.env.PORT || 9080
server.listen(PORT, console.log(`Server is running on port ${PORT}`))



// mongodb+srv://uabi:abishek@blog.zynhcof.mongodb.net/blog

//PW
// abishek

//username
//uabi