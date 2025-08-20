// models/blog.model.js
const Comment = require("./comment.model");

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    coverImage: {
        type: String, // Cloudinary URL for cover image
    },
    postImage: {
        type: String, // Cloudinary URL for post image
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    // 👇 New field to hold comments
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
}, { timestamps: true });

// Cascade delete comments when a blog is deleted
blogSchema.pre("findOneAndDelete", async function (next) {
    try {
        const blog = await this.model.findOne(this.getFilter());
        if (blog) {
            await Comment.deleteMany({ post: blog._id });
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('BlogPost', blogSchema);
