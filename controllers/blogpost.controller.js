// controllers/blog.controller.js
const BlogPost = require('../models/blogpost.model');
const cloudinary = require('../utils/cloudinary');
const User = require("../models/user.model");

const createBlog = async (req, res) => {
    try {
        let coverImageUrl = "";
        let postImageUrl = "";

        if (req.files?.coverImage) {
            const cover = await cloudinary.uploader.upload(req.files.coverImage[0].path);
            coverImageUrl = cover.secure_url;
        }
        if (req.files?.postImage) {
            const post = await cloudinary.uploader.upload(req.files.postImage[0].path);
            postImageUrl = post.secure_url;
        }

        const blog = new BlogPost({
            ...req.body,
            coverImage: coverImageUrl,
            postImage: postImageUrl,
            author: req.user.id
        });

        const savedBlog = await blog.save();

        // 🔥 Link blog to user
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { blogs: savedBlog._id } },
            { new: true }
        );

        return res.status(201).json(savedBlog);
    } catch (error) {
        console.error("Error creating blog:", error.message);
        return res.status(500).json({ message: "Failed to create blog" });
    }
};


const getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogPost.find().populate("author", "firstName lastName email");
        return res.status(200).json(blogs);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch blogs" });
    }
};

const updateBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findById(req.params.id);

        if (!blog) return res.status(404).json({ message: "Blog not found" });

        // Only author or admin can update
        if (blog.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Permission denied" });
        }

        // Handle new uploads if provided
        if (req.files?.coverImage) {
            const cover = await cloudinary.uploader.upload(req.files.coverImage[0].path);
            req.body.coverImage = cover.secure_url;
        }
        if (req.files?.postImage) {
            const post = await cloudinary.uploader.upload(req.files.postImage[0].path);
            req.body.postImage = post.secure_url;
        }

        const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: "Failed to update blog" });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findById(req.params.id);

        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Permission denied" });
        }

        await blog.remove();
        return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete blog" });
    }
};

module.exports = { createBlog, getAllBlogs, updateBlog, deleteBlog };
