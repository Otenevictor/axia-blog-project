
const mongoose = require('mongoose'); // Import Mongoose

// Define the schema for the user model
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true // Make name a required field
    },
    lastName: {
        type: String,
        required: true // Make name a required field
    },
    address: {
        type: String,
        required: true // Make name a required field
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        required: true, // Make email a required field
        unique: true,   // Ensure email is unique
        lowercase: true // Store email in lowercase
    },
    password: {
        type: String,
        required: true

    },
    isAdmin: {
        type: Boolean,
        default: false,
        // required: true // Make password a required field
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogPost'
    }]

}, { timestamps: true });

// Virtual populate
userSchema.virtual('populatedBlogPosts', {
    ref: 'BlogPost',
    localField: 'posts',
    foreignField: '_id'
});



const userModel = mongoose.model('User', userSchema);

module.exports = userModel;