const express = require('express');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Bodyparser midlleware

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//db config
const db = require('./config/keys').mongoURI;

// Connect to mongodb
mongoose
    .connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('error'));

// passport middleware
app.use(passport.initialize());

// passport configuration
require('./config/passport')(passport);

//Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Server running on port ' + port));