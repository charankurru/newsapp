const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const { attempt } = require('lodash');
var cloudinary = require('cloudinary');

const helper = require('../config/helpers');

const User = mongoose.model('User');
const postfeed = mongoose.model('Postfeed');
const conversation = require('../models/conversationModel');
const message = require('../models/MessageModel');

cloudinary.config({
  cloud_name: 'ddnl0lfzp',
  api_key: '778327583511247',
  api_secret: 'TaCKcxjsyeJRBkIuwnVscXYCHV0',
});

module.exports = {
  uploadImg(req, res) {
    cloudinary.uploader.upload(req.body.image, async (result) => {
      await User.update(
        {
          _id: req._id,
        },
        {
          $push: {
            images: {
              imgId: result.public_id,
              imgVersion: result.version,
            },
          },
        }
      )
        .then(() => {
          res.status(200).json({ message: 'uploaded successfully' });
        })
        .catch((err) => {
          res.status(400).json({ message: ' gone worst!' });
        });
    });
  },

  async SetProfile(req, res) {
    console.log('kya');
    console.log(req.body);

    await User.update(
      {
        _id: req._id,
      },
      {
        picId: req.body.imgId,
        picVersion: req.body.imgVersion,
      }
    )
      .then(() => {
        res.status(200).json({ message: 'changed successfully' });
      })
      .catch((err) => {
        res.status(400).json({ message: ' gone worse!' });
      });
  },
};
