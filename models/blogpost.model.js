// models/blog.model.js
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
    }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogSchema);
