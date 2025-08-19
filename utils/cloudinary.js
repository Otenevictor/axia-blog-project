const cloudinary = require('cloudinary').v2;


// CLOUDINARY_NAME
// CLOUDINARY_API_KEY
// CLOUDINARY_API_SECRETE
// configure Cloudinaray
cloudinary .config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRETE
})
// Export the configured cloudinary instance
module.exports = cloudinary;