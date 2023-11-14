const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const ValidatePostInput = require('../../validation/post');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

//@route GET api/posts/test
//@desc  Test posts routes
//@acces Public

router.post('/', passport.authenticate('jwt',{session: false}), (req, res) => {
    const {errors, isValid} = ValidatePostInput(req.body);
    if(isValid) {
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post));
});

//@route GET Post by id
//@desc  GET the current post
//@access Public
router.get('/:post_id',(req, res) =>{
    Post.findById(req.params.post_id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound: 'No post found with that ID'}));
});

//@route GET Post
//@desc  GET all post
//@access Public
router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.json({nopost:'There is no post'}));
});
//@route Deleting Post
//@desc  Deleting post by id
//@access Private
router.delete('/:post_id', passport.authenticate('jwt', {session: false}), (req, res) => {

    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.post_id)
                .then(post => {
                    if(post.user.toString !== req.user.id){
                        
                        return res.status(401).json({noauthrized: 'No authorization to delete this post'})
                }
                    post.remove().then(() => res.json({succes: true}));
                })
                .catch(err =>res.status(404).json({notfound: 'Post not found'}));
        })
    
});

//@route Like a Post
//@desc  Like post by user
//@access Private
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.post_id)
                .then(post =>{
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                        return res.status(400).json({alreadylike: 'user already liked this post'});
                    }
                    post.likes.unshift({user: req.user.id});
                    post.save().then(post => res.json(post))
                  
                })
                .catch(err =>res.status(404).json({notfound: 'Post not found'}));
        })
    
});

//@route Unlike a Post
//@desc  Unlike post by user
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                        return res.status(400).json({notlike: 'user not liked this post'});
                    }
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    post.likes.splice(removeIndex, 1);

                    post.save().then(post => res.status(post));
                    
                })
                .catch(err =>res.status(404).json({notfound: 'Post not found'}));
        });
    
});
module.exports = router;