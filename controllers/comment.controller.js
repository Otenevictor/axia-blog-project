// controllers/comment.controller.js
const Comment = require("../models/comment.model");

const addComment = async (req, res) => {
    try {
        const comment = new Comment({
            content: req.body.content,
            post: req.params.postId,
            author: req.user.id
        });

        await comment.save();
        return res.status(201).json(comment);
    } catch (error) {
        return res.status(500).json({ message: "Failed to add comment" });
    }
};

const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId }).populate("author", "firstName lastName");
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch comments" });
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Permission denied" });
        }

        await comment.remove();
        return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete comment" });
    }
};

module.exports = { addComment, getComments, deleteComment };
