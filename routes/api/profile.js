const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const ValidateProfileInput = require('../../validation/profile');

// Load Profile Model
const Profile = require('../../models/Profile');
const User = require('../../models/Users');

//@route GET api/profile/test
//@desc  Test profile routes
//@acces Public
router.get('/test', (req, res) => res.json({ msg: 'test' }));


//@route GET api/profile
//@desc  Get current user profile 
//@acces Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});
//@route POST api/profile
//@desc  create current user profile 
//@acces Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid } = ValidateProfileInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
   // Get fiels

   const profileFields = {};
   profileFields.user = req.user.id;
   if(req.body.handle) profileFields.handle = req.body.handle;
   if(req.body.compagny) profileFields.compagny = req.body.compagny;
   if(req.body.website) profileFields.website = req.body.website;
   if(req.body.location) profileFields.location = req.body.location;
   if(req.body.bio) profileFields.bio = req.body.bio;
   if(req.body.status) profileFields.status = req.body.status;
   if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // Skills = split into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
   // social
   profileFields.social = {};
   if(req.body.youtube) profileFields.youtube = req.body.youtube;
   if(req.body.twitter) profileFields.twitter = req.body.twitter;
   if(req.body.facebook) profileFields.facebook = req.body.facebook;
   if(req.body.linkedin) profileFields.linkedin = req.body.linkedin;
   if(req.body.instagram) profileFields.instagram = req.body.instagram;

   Profile.findOne({user: req.user.id})
    .then(profile =>{
        if(profile) {
            // Update
            Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
                ).then(profile =>res.json(profile.toString()));
        } else {
            // Create

            // Check if exits
        
            Profile.findOne({handle: profileFields.handle})
                .then(profile => {
                    if(profile){
                        errors.handle = 'That handle already exist';
                        res.status(400).json(errors);
                    }
                    new Profile(profileFields).save().then(profile => console.log(profile.toString()));
                });
        }
    })
});
module.exports = router;
