const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

const ctrlPost = require('../controllers/post.controllers');

const ctrlSemi = require('../controllers/semiUser.controller');

const jwtHelper = require('../config/jwtHelper');

const jwtHelper2 = require('../config/helpers');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/userProfile', jwtHelper.verifyJwtToken, ctrlUser.userProfile);

// post form
router.post('/postfeed', jwtHelper.verifyJwtToken, ctrlSemi.postfeed);

router.get('/getfeed', ctrlPost.getfeed);

router.post('/addlike', jwtHelper.verifyJwtToken, ctrlPost.addlike);

router.post('/addcomment', jwtHelper.verifyJwtToken, ctrlPost.addcomment);

router.get('/getcomment/:id', jwtHelper.verifyJwtToken, ctrlPost.getcomment);

router.get('/getUsers', ctrlPost.getUsers);

router.post('/friends', jwtHelper.verifyJwtToken, ctrlPost.addfriends);

router.get('/getsingleUser/:id', ctrlPost.getSingleUser);

router.post('/unfollow', jwtHelper.verifyJwtToken, ctrlSemi.UnFollowUser);

router.post('/removeuser', jwtHelper.verifyJwtToken, ctrlSemi.removeUser);

router.post('/mark/:id', jwtHelper.verifyJwtToken, ctrlSemi.MarkNotification);

router.get('/getbyname/:naam', ctrlSemi.getbyNaam);

module.exports = router;
