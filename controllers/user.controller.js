const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const { attempt } = require('lodash');

const User = mongoose.model('User');
const postfeed = mongoose.model('Postfeed');

module.exports.register = (req, res, next) => {
  var user = new User();
  user.fullName = req.body.fullName;
  user.email = req.body.email;
  user.password = req.body.password;
  user.save((err, doc) => {
    if (!err) res.send(doc);
    else {
      if (err.code == 11000)
        res.status(422).send(['Duplicate email adrress found.']);
      else return next(err);
    }
  });
};

module.exports.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate('local', (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) return res.status(200).json({ token: user.generateJwt() });
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
};

module.exports.userProfile = (req, res, next) => {
  User.findOne({ _id: req._id }, (err, user) => {
    if (!user)
      return res
        .status(404)
        .json({ status: false, message: 'User record not found.' });
    else
      return res
        .status(200)
        .json({ status: true, user: _.pick(user, ['fullName', 'email']) });
  });
};

module.exports.postfeed = (req, res, next) => {
  console.log(req.body);
  User.findOne({ _id: req._id }, (err, user) => {
    if (!user)
      return res
        .status(404)
        .json({ status: false, message: 'User record not found.' });
    else if (user)
      var body = {
        user: user._doc._id,
        username: user._doc.fullName,
        post: req.body.post,
        created: new Date(),
      };
    postfeed
      .create(body)
      .then(async (post) => {
        console.log(post._id);
        console.log(post._doc._id);
        console.log(post._doc.post);
        console.log(req._id);
        await User.update(
          { _id: req._id },
          {
            $push: {
              posts: {
                postId: post._id,
                post: req.body.post,
                created: new Date.now(),
              },
            },
          }
        );
        res.status(200).json({ message: 'post Created', post });
      })
      .catch((err) => {
        res.status(400).json({ message: 'error Occured' });
      });
  });
};
