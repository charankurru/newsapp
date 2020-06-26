const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const { attempt } = require('lodash');
const { getfeed } = require('./user.controller');

const User = mongoose.model('User');
const postfeed = mongoose.model('Postfeed');

module.exports = {
  async getfeed(req, res) {
    try {
      var posts = await postfeed
        .find({})
        .populate('user')
        .sort({ created: -1 });

      var Top = await postfeed
        .find({ totalLiked: { $gte: 0 } })
        .populate('user')
        .sort({ created: -1 });

      return res.status(200).json({ message: 'all posts', posts, Top });
    } catch (err) {
      return res.status(400).json({ message: 'error occured' });
    }
  },

  async addlike(req, res) {
    var loggedId = req._id;
    var postid = req.body._id;
    User.findOne({ _id: req._id }, (err, core) => {
      if (!core)
        return res
          .status(404)
          .json({ status: false, message: 'User record not found.' });
      else if (core)
        postfeed
          .update(
            { _id: postid, 'likes.username': { $ne: core._doc.fullName } },
            {
              $push: {
                likes: {
                  username: core._doc.fullName,
                },
              },
              $inc: { totalLiked: 1 },
            }
          )
          .then(() => {
            res.status(200).json({ message: 'you like  the post' });
          })
          .catch((err) => {
            res.status(400).json({ message: 'error got' });
          });
    });
  },

  addcomment(req, res) {
    var postid = req.body.postId;
    var commentbody = req.body.com;
    postfeed
      .update(
        { _id: postid },
        {
          $push: {
            comments: {
              userId: req._id,
              username: req.fullName,
              comment: commentbody,
              createdAt: new Date(),
            },
          },
        }
      )
      .then((posts) => {
        res.status(200).json({ message: 'you commented  rhis post' });
      })
      .catch((err) => {
        res.status(400).json({ message: 'error got' });
      });
  },

  async getcomment(req, res) {
    await postfeed
      .findOne({ _id: req.params.id })
      .populate('user')
      .populate('comments.userId')
      .then((posts) => {
        res.status(200).json({ message: 'got your post', posts });
      })
      .catch((err) => {
        res.status(400).json({ message: 'error got' });
      });
  },

  async getUsers(req, res) {
    await User.find({})
      .populate('followings.userfollowing')
      .populate('followers.follower')
      .populate('ChatList.receiverId')
      .populate('ChatList.msgId')
      .then((posts) => {
        res.status(200).json({ message: 'got users', posts });
      })
      .catch((err) => {
        res.status(400).json({ message: 'error got' });
      });
  },

  addfriends(req, res) {
    const friend = async () => {
      await User.update(
        {
          _id: req._id,
          'followings.userfollowing': { $ne: req.body.playId },
        },
        {
          $push: {
            followings: {
              userfollowing: req.body.playId,
            },
          },
        }
      );

      await User.update(
        {
          _id: req.body.playId,
          'followers.follower': { $ne: req._id },
        },
        {
          $push: {
            followers: {
              follower: req._id,
            },
            notifications: {
              senderId: req._id,
              message: `${req.fullName} is now following you.`,
              created: new Date(),
              viewProfile: false,
            },
          },
        }
      );
    };
    friend()
      .then((done) => {
        res.status(200).json({ message: 'following the user now', done });
      })
      .catch(() => {
        res.status(400).json({ message: 'something went wrong!' });
      });
  },

  getSingleUser(req, res) {
    User.findOne({ _id: req.params.id })
      .populate('followings.userfollowing')
      .populate('followers.follower')
      .populate('ChatList.receiverId')
      .populate('ChatList.msgId')
      .populate('notifications.senderId')
      .then((done) => {
        res.status(200).json({ message: 'got User', done });
      })
      .catch(() => {
        res
          .status(400)
          .json({ message: 'something went wrong in bringing the user!' });
      });
  },
};
