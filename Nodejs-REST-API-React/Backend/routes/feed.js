const express = require('express');
const { check, body } = require('express-validator');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const feedController = require('../controller/feed');

router.get('/post', isAuth, feedController.getPost);

router.post('/post',
    isAuth,
    [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 10 })
], feedController.createPost);

router.get('/post/:postId', isAuth, feedController.singlePost);

router.put('/post/:postId', isAuth, feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;