// routes/comment.route.js
const express = require("express");
const { authentication } = require("../auth.middleware/auth.middleware");
const { addComment, getComments, deleteComment , updateComment} = require("../controllers/comment.controller");

const router = express.Router();

router.post("/comment/:postId", authentication, addComment);
router.put("/comment/:id", authentication, updateComment);
router.get("/comment/:postId", getComments);
router.delete("/comment/:id", authentication,  deleteComment);

module.exports = router;
