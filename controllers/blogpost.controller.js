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
            const cover = await cloudinary.uploader.upload(postPath);
            coverImageUrl = cover.secure_url;
            await fs.unlink(postPath); // remove local file after upload
        }

        if (req.files?.postImage) {
            const postPath = req.files.postImage[0].path;
            const post = await cloudinary.uploader.upload(postPath);
            postImageUrl = post.secure_url;
            await fs.unlink(postPath); // remove local file after upload
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
        console.error("Error creating blog:", error.message);
        return res.status(500).json({ message: "Failed to create blog" });
    }
};


const getAllBlogs = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Permission denied. Admins only." });
    }

    const posts = await BlogPost.find()
      .populate("author", "firstName lastName email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "firstName lastName" }
      });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get all blogs error:", error);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

const getMyBlogs = async (req, res) => {
  try {
    const posts = await BlogPost.find({ author: req.user.id })
      .populate("author", "firstName lastName email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "firstName lastName" }
      });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "You have no posts yet" });
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get my blogs error:", error);
    return res.status(500).json({ message: "Failed to fetch your blogs" });
  }
};
const getMyBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id)
      .populate("author", "firstName lastName email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "firstName lastName" }
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure the requester is the owner or an admin
    if (post.author._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Permission denied" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Get blog by id error:", error);
    return res.status(500).json({ message: "Failed to fetch the post" });
  }
};


// Get all published posts
const getPublishedPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ isPublished: true })
      .populate("author", "firstName lastName email") // populate author basic info
      .sort({ createdAt: -1 }); // newest first

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No published posts found" });
    }

    return res.status(200).json({
      message: "Published posts fetched successfully",
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Error fetching published posts:", error);
    return res.status(500).json({ message: "Failed to fetch published posts" });
  }
};



const updateBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        // ✅ Only the author can update
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Permission denied, you are not the author" });
        }

        // Handle new uploads if provided
        if (req.files?.coverImage) {
            const postPath = req.files.coverImage[0].path;
            const cover = await cloudinary.uploader.upload(postPath);
            req.body.coverImage = cover.secure_url;
            await fs.unlink(postPath);
        }

        if (req.files?.postImage) {
            const postPath = req.files.postImage[0].path;
            const post = await cloudinary.uploader.upload(postPath);
            req.body.postImage = post.secure_url;
            await fs.unlink(postPath);
        }

        const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(updated);
    } catch (error) {
        console.error("Update blog error:", error);
        return res.status(500).json({ message: "Failed to update blog" });
    }
};


const deleteBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        // ✅ Author or Admin can delete
        if (blog.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Permission denied, only author or admin can delete" });
        }

        await blog.deleteOne();
        return res.status(200).json({ message: "Blog and its comments deleted successfully" });
    } catch (error) {
        console.error("Delete blog error:", error);
        return res.status(500).json({ message: "Failed to delete blog", error: error.message });
    }
};


module.exports = { createBlog,getMyBlogs, getAllBlogs,getMyBlogById, updateBlog, deleteBlog , getPublishedPosts};
