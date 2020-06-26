const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const { attempt } = require('lodash');

const helper = require('../config/helpers');

const User = mongoose.model('User');
const postfeed = mongoose.model('Postfeed');
const conversation = require('../models/conversationModel');
const message = require('../models/MessageModel');

module.exports = {
  async SendMessage(req, res) {
    var { sender_id, receiver_Id } = req.params;

    conversation.find(
      {
        $or: [
          {
            participants: {
              $elemMatch: { senderId: sender_id, receiverId: receiver_Id },
            },
          },
          {
            participants: {
              $elemMatch: { senderId: receiver_Id, receiverId: sender_id },
            },
          },
        ],
      },
      async (err, result) => {
        if (result.length > 0) {
          console.log('if-block');

          const helpermsg = await message.findOne({
            conversationId: result[0]._id,
          });
          helper.updateChatList(req, helpermsg);

          await message
            .updateOne(
              {
                conversationId: result[0]._id,
              },
              {
                $push: {
                  message: {
                    senderId: req._id,
                    receiverId: req.params.receiver_Id,
                    sendername: req.fullName,
                    receivername: req.body.receivername,
                    body: req.body.message,
                  },
                },
              }
            )
            .then(() => {
              res.status(200).json({ message: 'message sent in success' });
            })
            .catch((err) => {
              res.status(400).json({ message: 'err vacchindi' });
            });
        } else {
          console.log('else block');

          var newchat = new conversation();
          newchat.participants.push({
            senderId: req._id,
            receiverId: req.params.receiver_Id,
          });

          var savechat = await newchat.save();

          //console.log(savechat);

          var newMessage = new message();
          newMessage.conversationId = savechat._id;
          newMessage.sender = req.fullName;
          newMessage.receiver = req.body.receivername;
          newMessage.message.push({
            senderId: req._id,
            receiverId: req.params.receiver_Id,
            sendername: req.fullName,
            receivername: req.body.receivername,
            body: req.body.message,
          });

          // console.log(newMessage);

          await newMessage
            .save()
            .then(() => {
              res.status(200).json({ message: 'message sent' });
            })
            .catch((err) => {
              res.status(400).json({ message: 'err vacchindi' });
            });

          await User.update(
            {
              _id: req._id,
            },
            {
              $push: {
                ChatList: {
                  $each: [
                    {
                      receiverId: req.params.receiver_Id,
                      msgId: newMessage._doc._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );

          await User.update(
            {
              _id: req.params.receiver_Id,
            },
            {
              $push: {
                ChatList: {
                  $each: [
                    {
                      receiverId: req._id,
                      msgId: newMessage._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );
        }
      }
    );
  },

  async GetAllMesgs(req, res) {
    var { sender_id, receiver_Id } = req.params;
    var cons = await conversation
      .findOne({
        $or: [
          {
            $and: [
              { 'participants.senderId': sender_id },
              { 'participants.receiverId': receiver_Id },
            ],
          },
          {
            $and: [
              { 'participants.senderId': receiver_Id },
              { 'participants.receiverId': sender_id },
            ],
          },
        ],
      })
      .select('_id');

    if (cons) {
      var msg = await message.findOne({ conversationId: cons._id });
      res.status(200).json({ message: 'Messages returned', msg });
    }
  },

  async markMessages(req, res) {
    const { sender, receiver } = req.params;

    const msg = await message.aggregate([
      { $unwind: '$message' },
      {
        $match: {
          $and: [
            { 'message.sendername': receiver, 'message.receivername': sender },
          ],
        },
      },
    ]);

    if (msg.length > 0) {
      try {
        msg.forEach(async (value) => {
          await message.update(
            {
              'message._id': value.message._id,
            },
            {
              $set: { 'message.$.isRead': true },
            }
          );
        });
        res.status(200).json({ message: 'marked message as read' });
      } catch (err) {
        res.status(400).json({ message: 'err occured in marking' });
      }
    }
  },

  async markAllMsgs(req, res) {
    const msg = await message.aggregate([
      { $match: { 'message.receivername': req.fullName } },
      { $unwind: '$message' },
      { $match: { 'message.receivername': req.fullName } },
    ]);

    if (msg.length > 0) {
      try {
        msg.forEach(async (value) => {
          await message.update(
            {
              'message._id': value.message._id,
            },
            {
              $set: { 'message.$.isRead': true },
            }
          );
        });
        res.status(200).json({
          message: ' all messages marked as read marked message as read',
        });
      } catch (err) {
        res.status(400).json({ message: 'err occured in marking' });
      }
    }
  },
};
