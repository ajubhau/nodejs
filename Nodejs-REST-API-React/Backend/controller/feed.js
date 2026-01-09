const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPost = async(req, res, next) => {
    let currentPage = req.params.page || 1;
    let perPage = 2;
    try {
        const totalCount = await Post.find().countDocuments();
        const posts =  await Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Post fetched successfully.',
            posts: posts,
            totalItems: totalCount
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    post.save(post).then(result => {
        return User.findById(req.userId);
    }).then(user => {
        creator = user;
        user.posts.push(user._id);
        return user.save();
    }).then(resData => {
        res.status(201).json({
            message: 'Post created successfully.',
            post: post,
            creator: { _id: creator._id, name: creator.name}
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    });
}

exports.singlePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById({_id: postId}).then(post => {
        if (!post) {
            const error = new Error('Post not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(201).json({ message: 'Post fetch successfully', post: post});
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const body = {
        title: req.body.title,
         content: req.body.content,
        imageUrl: req.body.imageUrl
    }
       
     Post.findOneAndUpdate({_id: postId}, body).then(post => {
        if (!post) {
            const error = new Error('Could not update post.');
            error.statusCode = 422;
            throw error;
        }
        res.status(201).json({ message: 'Post updated successfully', post: post});
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    let deletedPost;
    Post.findByIdAndDelete({ _id: postId}).then(post => {
        deletedPost = post;
        if (!post) {
            const error = new Error('Could not delete post.');
            error.statusCode = 422;
            throw error;
        }
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        res.status(201).json({ message: 'Post deleted successfully', post: deletedPost});
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}