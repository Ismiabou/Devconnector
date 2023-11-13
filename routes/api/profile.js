const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const ValidateProfileInput = require('../../validation/profile');
const ValidateExperienceInput = require('../../validation/experience');
const ValidateEducationInput = require('../../validation/education'); 
// Load Profile Model
const Profile = require('../../models/Profile');
const user = require('../../models/Users');

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

//@route GET api/profile/handle/:handle
//@desc  GET profile by handle
//@acces Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({handle: req.params.handle})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

//@route GET api/profile/user/:user_id
//@desc  GET profile by user_id
//@acces Public
router.get('/user/:user_id', (req, res) => {
    const errors ={};
    Profile.findOne({user:req.params.user_id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user";
                res.status(404).json(errors);
            }
        return res.json(profile);
        })
        .catch(err => res.status(900).json(err));
});

//@route POST api/profile
//@desc  create current user profile 
//@acces Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid } = ValidateProfileInput(req.body);

    if (isValid){}
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
                ).then(profile =>res.json(profile));
        } else {
            // Create

            // Check if exits
        
            Profile.findOne({handle: profileFields.handle})
                .then(profile => {
                    if(profile){
                        errors.handle = 'That handle already exist';
                        res.status(400).json(errors);
                    }
                    new Profile(profileFields).save().then(profile => res.json(profile));
                });
        }
    })
});
//@route POST api/profile/experience
//@desc  Add experience to profile 
//@acces Private

router.post('/experience', passport.authenticate('jwt',{session:false}),(req, res) => {
    const {errors, isValid} = ValidateExperienceInput(req.body);

    if(isValid) {
        return res.status(400).json(errors);
    }
    Profile.findOne({user:req.user.id})
        .then(profile =>{
            const newExp = {
                title: req.body.title,
                compagny: req.body.compagny,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile));
        })
});

//@route POST api/profile/education
//@desc  Add education to profile 
//@acces Private

router.post('/education', passport.authenticate('jwt',{session:false}),(req, res) => {
    const {errors, isValid} = ValidateEducationInput(req.body);

    if(isValid) {
        return res.status(400).json(errors);
    }
    Profile.findOne({user:req.user.id})
        .then(profile =>{
            const newEduc = {
                school: req.body.school,
                degree: req.body.degree,
                fieldstudy: req.body.fieldstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            profile.education.unshift(newEduc);
            profile.save().then(profile => res.json(profile));
        })
});

//@route Delete api/profile/experience
//@desc  Delete experience to profile 
//@acces Private

router.delete('/experience/:exp_id', passport.authenticate('jwt',{session:false}),(req, res) => {
    Profile.findOne({user:req.user.id})
        .then(profile =>  {
            const removeIndex = profile.experience
                .map(item =>item.id)
                .indexOf(req.params.exp_id);
            profile.experience.splice(removeIndex, 1);

            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.status(404).json(err));
});

//@route Delete api/profile/education
//@desc  Delete education to profile 
//@acces Private

router.delete('/education/:educ_id', passport.authenticate('jwt',{session:false}),(req, res) => {
    Profile.findOne({user:req.user.id})
        .then(profile =>  {
            const removeIndex = profile.education
                .map(item =>item.id)
                .indexOf(req.params.educ_id);
            profile.education.splice(removeIndex, 1);

            profile.save().then(profile => res.json(profile))
        })
        .catch(err => res.status(404).json(err));
});

//@route Delete api/profile
//@desc  Delete user and profile 
//@acces Private

router.delete('/', passport.authenticate('jwt',{session:false}),(req, res) => {
    Profile.findOneAndRemove({user : req.user.id})
        .then(() => {
            user.findOneAndRemove({_id: req.user.id})
                .then(() => {
                    return res.json({success: true});
                });
        })
});
module.exports = router;
