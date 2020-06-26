const express = require('express');
const router = express.Router();
const jwtHelper = require('../config/jwtHelper');
const msgCtrl = require('../controllers/messages.controller');
const ImgCtrl = require('../controllers/images.Controllers');

router.post(
  '/chat-messages/:sender_id/:receiver_Id',
  jwtHelper.verifyJwtToken,
  msgCtrl.SendMessage
);

router.get(
  '/chat-messages/:sender_id/:receiver_Id',
  jwtHelper.verifyJwtToken,
  msgCtrl.GetAllMesgs
);

router.get(
  '/markmessage/:sender/:receiver',
  jwtHelper.verifyJwtToken,
  msgCtrl.markMessages
);

//router.post('/upload-image', jwtHelper.verifyJwtToken, ImgCtrl.uploadImg);

router.get('/markallmsgs', jwtHelper.verifyJwtToken, msgCtrl.markAllMsgs);

module.exports = router;
