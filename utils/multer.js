const multer = require("multer")
const upload = multer({dest: "uploads/"});

// Export the upload instance so it can be used in other files
module.exports = upload;