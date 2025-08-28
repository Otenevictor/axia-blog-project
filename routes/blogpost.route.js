// routes/blog.route.js
const express = require("express");
const { authentication, adminAuth } = require("../auth.middleware/auth.middleware");
const { createBlog, getAllBlogs, getMyBlogs,getMyBlogById, getPublishedPosts, updateBlog, deleteBlog } = require("../controllers/blogpost.controller");
const upload = require("../utils/multer");

const router = express.Router();

router.post(
    "/post",
    authentication,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "postImage", maxCount: 1 }
    ]),
    createBlog
);

// Admin only
router.get("/post/allpost", adminAuth, getAllBlogs);
router.get("/post/published", getPublishedPosts);

// User: get all their blogs
router.get("/my-posts", authentication, getMyBlogs);

// User: get single blog by id
router.get("/my-posts/:id", authentication, getMyBlogById);
router.put("/posts/:id", authentication, upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "postImage", maxCount: 1 }
]), updateBlog);
router.delete("/post/:id", authentication, deleteBlog);

module.exports = router;
