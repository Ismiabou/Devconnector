const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
// @route for Users
const User = require('../../models/Users');

// Load validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route GET api/users/test
//@desc Test users routes
//@acces Public
router.get('/test', (req, res) => res.json({ msg: 'test' }));

// @route api/users/register
// @Desc register users routes
// @acces Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check if the user validates the required fields 
    if (isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.email= "email already exists";
                return res.status(400).json(errors);
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm',
                });
                const newUser = new User({
                    email: req.body.email,
                    name: req.body.name,
                    avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => res.json(err));
                    })
                })
            }
        });
});
// @route Get api/users/login
// @desc  Login Users
// @acces Public

router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    // Check if the user validates the required fields 
        if (isValid) {
        return res.status(404).json(errors);
        }
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email }).then(user => {
        // Check if user
        if (!user) {
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }

        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched  
                const payload = { id: user.id, name: user.name, email: user.email };
                // Sign In
                jwt.sign(
                    payload,
                    keys.secretOrkey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    });
            } else {
                errors.password = 'Password incorrect';
                return res.status(404).json(errors);
            }
        });
    });
});

// @route api/users/current
// @desc  return current user
// @access public
router.get('/current', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    });

module.exports = router;