const express = require('express');
const router = express.Router();

const jwtHelper = require('../config/jwtHelper');
const ImgCtrl = require('../controllers/images.Controllers');

router.post('/upload-image', jwtHelper.verifyJwtToken, ImgCtrl.uploadImg);

router.post('/setProfile', jwtHelper.verifyJwtToken, ImgCtrl.SetProfile);

module.exports = router;
