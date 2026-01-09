const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name; 

    bcrypt.hash(password, 10)
    .then(encryptPass => {
        const user = new User({
            email: email,
            password: encryptPass,
            name: name
        });
        return user.save();
    }).then(user => {
        res.status(201).json({
            message: 'User created successfully',
            userId: user._id
        })
    }).catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.signin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Check validation.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email}).then(user => {
         if (!user) {
            const error = new Error('User with email and password could not match.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password)
    })
    .then(isMatch => {
        if (!isMatch) {
            const error = new Error('User with email and password could not match.');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'somesuperscret',
            {expiresIn: '1h'}
        );
        res.status(200).json({message: 'Singin successfully', token: token, userId: loadedUser._id.toString()})
    }).catch(err => {
         if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
    
    
}