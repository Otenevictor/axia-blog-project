// routes/blog.route.js
const express = require("express");
const { authentication } = require("../auth.middleware/auth.middleware");
const { createBlog, getAllBlogs, updateBlog, deleteBlog } = require("../controllers/blogpost.controller");
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

router.get("/post/allpost", getAllBlogs);
router.put("/posts/:id", authentication, upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "postImage", maxCount: 1 }
]), updateBlog);
router.delete("/post/:id", authentication, deleteBlog);

module.exports = router;
