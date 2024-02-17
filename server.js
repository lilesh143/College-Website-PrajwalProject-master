require("dotenv").config();
const { sessionSecret } = process.env;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash')
const session = require('express-session')


const app = express();
console.log(sessionSecret);


app.use(session({
    secret: sessionSecret,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}))

// app.use(flash())

app.set('view engine', 'ejs')

const userRouter = require('./routes/userRoutes');
const webRouter = require('./routes/webRoute');

require('./config/dbConnection')


app.use(express.static('public'))

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors());
app.use(flash())

app.use('/api', userRouter);
// app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', webRouter);

app.use((err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message
    })

})


app.listen(3000, () => console.log('Server is running on port 3000'));