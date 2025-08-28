const BlogPost = require("../models/blogpost.model");
const Comment = require("../models/comment.model");

const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;

        // check blog exists
        const blog = await BlogPost.findById(postId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // create comment
        const comment = new Comment({
            content,
            post: postId,
            author: req.user.id
        });
        await comment.save();

        // link comment to blog
        blog.comments.push(comment._id);
        await blog.save();

        return res.status(201).json(comment);
    } catch (error) {
        console.error("Add comment error:", error);
        return res.status(500).json({ message: "Failed to add comment", error: error.message });
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

const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Content is required" });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found for this user" });
        }

        // Check ownership
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Permission denied not the owner" });
        }

        // Update
        comment.content = content;
        await comment.save();

        return res.status(200).json({ message: "Comment updated", comment });
    } catch (error) {
        console.error("Update comment error:", error);
        return res.status(500).json({ message: "Failed to update comment", error: error.message });
    }
};



const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Permission denied you are not the author" });
        }

        await comment.deleteOne();
        return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete comment" });
    }
};

module.exports = { addComment, getComments, deleteComment , updateComment };
