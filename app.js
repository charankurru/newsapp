require('./config/config');
require('./models/db');
require('./config/passportConfig');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const _ = require('lodash');

const rtsIndex = require('./routes/index.router');
const mesgIndex = require('./routes/messages.router');
const imageIndex = require('./routes/imageIndex');

var app = express();

// middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use('/api', rtsIndex);
app.use('/api', mesgIndex);
app.use('/api', imageIndex);

//spcket
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

//userclass

const { User } = require('./config/UserClass');

require('./socket/streams')(io, User, _);
require('./socket/private')(io);

// error handler
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    var valErrors = [];
    Object.keys(err.errors).forEach((key) =>
      valErrors.push(err.errors[key].message)
    );
    res.status(422).send(valErrors);
  } else {
    console.log(err);
  }
});

// start server
server.listen(process.env.PORT || '3000', () =>
  console.log(`Server started at port : 3000`)
);
