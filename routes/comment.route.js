// routes/comment.route.js
const express = require("express");
const { authentication } = require("../auth.middleware/auth.middleware");
const { addComment, getComments, deleteComment } = require("../controllers/comment.controller");

const router = express.Router();

router.post("/:postId", authentication, addComment);
router.get("/:postId", getComments);
router.delete("/:id", authentication, deleteComment);

module.exports = router;
