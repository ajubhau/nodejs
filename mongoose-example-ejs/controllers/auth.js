require('dotenv').config(); // Load environment variables
const User = require('../models/user');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    let userData;
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login page',
            errorMessage: errors.array()[0].msg
        });
    }
    User.findOne({email: email})
    .then(user => {
        userData = user;
        if(!user) {
            req.flash('error', 'Invalid email.');
            return res.redirect('/login')
        }
        return bcrypt.compare(password, user.password)
    })
    .then(isMatch => {
        if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = userData;
            return req.session.save(err => {
                console.log(err);
                res.redirect('/');
            })
        }
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login')
    })
    .catch(err => {
        console.log(err);
        res.redirect('/login');
    })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/')
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Singup page',
        errorMessage: message
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Singup page',
            errorMessage: errors.array()[0].msg
        })
    }
    bcrypt
        .hash(password, 10)
        .then(encryptPass => {
            const user = new User({
                email: email,
                password: encryptPass,
                cart: {
                    items: []
                }
            });
            const mailOptions = {
                from: 'ajinkyathakre12@gmail.com', // Sender address
                to: email, // List of recipients
                subject: 'Welcome to Our Service!', // Subject line
                text: `Hello, welcome to our service! ${email}`, // Plain text body
                html: '<b>Hello, welcome to our service!</b>', // HTML body
                // You can also add attachments here
                // attachments: [
                //     {
                //         filename: 'attachment.pdf',
                //         path: '/path/to/attachment.pdf',
                //     },
                // ],
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    // Handle error in your Express route, e.g., send an error response
                } else {
                    console.log('Email sent: ' + info.response);
                    // Handle success in your Express route, e.g., send a success response
                }
            });
            return user.save();
        })
        .then((result) => res.redirect('/login'))
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        })
}

exports.resetPassword = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset-password', {
        path: '/auth/reset-password',
        pageTitle: 'Reset password',
        errorMessage: message
    })
}

exports.postReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/auth/reset-password');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found.');
                return res.redirect('/auth/reset-password')
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            console.log(user)
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            const mailOptions = {
                from: 'ajinkyathakre12@gmail.com', // Sender address
                to: req.body.email, // List of recipients
                subject: 'Password reset', // Subject line
                text: `Hello, welcome to our service!`, // Plain text body
                html: `
                    <p>You requested a password reset.</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `, // HTML body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    // Handle error in your Express route, e.g., send an error response
                } else {
                    console.log('Email sent: ' + info.response);
                    // Handle success in your Express route, e.g., send a success response
                }
            });

        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        })
    });
}

 exports.updatePassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now()}})
    .then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/update-password', {
            path: `/update-password`,
            pageTitle: 'Update password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        })
    })
    .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        })
    
}

exports.postUpdatepassword = (req, res, next) => {
    const password = req.body.password;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
    let updateUser;
    User.findOne({_id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now()}})
    .then(user => {
        updateUser = user;
       return bcrypt.hash(password, 10);
    })
    .then(hashedPassword => {
        updateUser.resetToken = undefined;
        updateUser.resetTokenExpiration = undefined;
        updateUser.password = hashedPassword;
        return updateUser.save();
    })
    .then(result => {
        res.redirect('/login')
    })
    .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        })
}