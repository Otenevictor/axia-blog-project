// controllers/blog.controller.js
const BlogPost = require('../models/blogpost.model');
const cloudinary = require('../utils/cloudinary');
const User = require("../models/user.model");
const fs = require("fs/promises");


const createBlog = async (req, res) => {
    try {
        let coverImageUrl = "";
        let postImageUrl = "";

        if (req.files?.coverImage) {
            const postPath = req.files.coverImage[0].path;
            const cover = await cloudinary.uploader.upload(req.files.coverImage[0].path);
            coverImageUrl = cover.secure_url;
            // remove local file after upload
            await fs.unlink(postPath);
        }
        if (req.files?.postImage) {
            const postPath = req.files.postImage[0].path;
            const post = await cloudinary.uploader.upload(req.files.postImage[0].path);
            postImageUrl = post.secure_url;
            // remove local file after upload
            await fs.unlink(postPath);
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
            { $push: { posts: savedBlog._id } },
            { new: true }
        );

        return res.status(201).json(savedBlog);
    } catch (error) {
        // remove local file after upload
        await fs.unlink(postPath);
        console.error("Error creating blog:", error.message);
        return res.status(500).json({ message: "Failed to create blog" });
    }
};


const getAllBlogs = async (req, res) => {
    try {
        const posts = await BlogPost.find().populate("author", "firstName lastName email").populate({
            path: "comments",
            populate: { path: "author", select: "firstName lastName" }
        });;
        return res.status(200).json(posts);
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
            const postPath = req.files.coverImage[0].path;
            const cover = await cloudinary.uploader.upload(postPath);
            req.body.coverImage = cover.secure_url;
            // remove local file after upload
            await fs.unlink(postPath);
        }
        if (req.files?.postImage) {
            const postPath = req.files.postImage[0].path;
            const post = await cloudinary.uploader.upload(req.files.postImage[0].path);
            req.body.postImage = post.secure_url;
            // remove local file after upload
            await fs.unlink(postPath);
        }

        const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(updated);
    } catch (error) {
        // remove local file after upload
        await fs.unlink(postPath);
        return res.status(500).json({ message: "Failed to update blog" });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findOneAndDelete({ _id: req.params.id });
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        return res.status(200).json({ message: "Blog and its comments deleted successfully" });
    } catch (error) {
        console.error("Delete blog error:", error);
        return res.status(500).json({ message: "Failed to delete blog", error: error.message });
    }
};

module.exports = { createBlog, getAllBlogs, updateBlog, deleteBlog };
