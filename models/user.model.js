const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: "Full name can't be empty",
  },
  email: {
    type: String,
    required: "Email can't be empty",
    unique: true,
  },
  password: {
    type: String,
    required: "Password can't be empty",
    minlength: [4, 'Password must be atleast 4 character long'],
  },
  saltSecret: String,
  posts: [
    {
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'postfeed' },
      post: { type: String },
      created: { type: Date, default: Date.now() },
    },
  ],

  followings: [
    { userfollowing: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
  ],

  followers: [
    { follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
  ],
  notifications: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String },
      viewProfile: { type: Boolean, default: false },
      created: { type: Date, default: Date.now() },
      read: { type: Boolean, default: false },
      date: { type: String, default: '' },
    },
  ],
  ChatList: [
    {
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      msgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    },
  ],
  picVersion: { type: String, default: '1592916353' },
  picId: { type: String, default: 'v31avvznqcfkzbor3aod.jpg' },
  images: [
    {
      imgId: { type: String, default: '' },
      imgVersion: { type: String, default: '' },
    },
  ],
});

// Custom validation for email
userSchema.path('email').validate((val) => {
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events
userSchema.pre('save', function (next) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(this.password, salt, (err, hash) => {
      this.password = hash;
      this.saltSecret = salt;
      next();
    });
  });
});

// Methods
userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJwt = function () {
  return jwt.sign(
    { _id: this._id, fullName: this.fullName },
    process.env.JWT_SECRET,
    {
      expiresIn: '3660880',
    }
  );
};

userSchema.set('autoIndex', false);

module.exports = mongoose.model('User', userSchema);
