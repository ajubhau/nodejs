const express = require('express');

const { check, body } = require('express-validator');

const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post('/login', 
    [
        check('email')
            .isEmail()
            .withMessage('Please enter valid email address.'),
        check('password')
            .isLength({ min: 5 })
            .withMessage('Please enter valid password.')
    ], 
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
    '/signup',
    [check('email')
        .isEmail()
        .withMessage('Please enter valid email address.')
        .custom((value, {req}) => {
            return User.findOne({email: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-Mail exists already, please pick a different one.');
                };
            });
        }),
     body('password', 'Please enter a password with only number and text and at least 5 characters.')
        .isLength({ min:5 })
        .isAlphanumeric(),
     body('confirmPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match.');
            }
            return true;
        })
    ],
     authController.postSignup
);

router.get('/auth/reset-password', authController.resetPassword);

router.post('/auth/reset', authController.postReset);

router.get('/reset/:token', authController.updatePassword);

router.post('/auth/update-password', authController.postUpdatepassword)

module.exports = router;