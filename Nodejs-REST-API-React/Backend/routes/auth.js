const express = require('express');
const { body } =  require('express-validator')

const router = express.Router();
const authController = require('../controller/auth');

const User = require('../models/user');

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email address')
        .custom((value, req) => {
            return User.findOne({email: value}).then(user => {
                if (user){
                    return Promise.reject('Email already exists.')
                }
            })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({min: 5}),
    body('name')
        .trim()
        .not()
        .isEmpty(),
    
],
authController.signup
);

router.post('/signin', [
    body('email').isEmail().withMessage('Please enter valid email address.'),
    body('password').trim().isLength({min: 5})
],
authController.signin)

module.exports = router;