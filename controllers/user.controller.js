const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken'); // Importing JWT for token generation


// Importing the user model and bcrypt for password hashing
const createUser = async (req, res) => {
    // get the persons registration details and spreads others
    const { email, password, ...others } = req.body;

    // check if the email and password exists
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide valid credentials (email and password).' });
    }

    try {
        // check if user already exists in our database
        const isUser = await userModel.findOne({ email });
        if (isUser) {
            return res.status(409).json({ message: 'User with this email already exists. Please login to your account.' }); // 409 Conflict
        }

        // now we can create a hashed password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        console.log(hashedPassword); // Consider removing this in production

        // continue with the registration
        const newUser = new userModel({ email, password: hashedPassword, ...others });
        const savedUser = await newUser.save();
        return res.status(201).json(savedUser); // 201 Created
    } catch (error) {
        console.error('Error creating user:', error.message); // Log full error for debugging
        return res.status(500).json({ message: 'Something went wrong during user registration.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await userModel.find();
        if (!allUsers || allUsers.length === 0) {
            return res.status(404).json({ message: 'No users found.' });
        }
        // Optionally, you can format the response to exclude sensitive fields like password
        return res.status(200).json(allUsers); // 200 OK
    } catch (error) {
        console.error('Error fetching users:', error.message);
        return res.status(500).json({ message: 'Something went wrong while fetching users.' });
    }
};


const updateUser = async (req, res) => {
    const id = req.user.id; // Get user id from authentication middleware
    const payload = req.body;

    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { ...payload },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong while updating the user.' });
    }
};

const deleteUser = async (req, res) => {
    const id = req.user.id; // Get user id from authentication middleware

    try {
        const deletedUser = await userModel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ message: 'User deleted successfully.', deletedUser });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong while deleting the user.' });
    }
};

// login a user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password for login.' });
    } 
    try {
        // get the user from the database
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials: Account does not exist.' });
        }

        // compare the password
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials: Incorrect password.' });
        }

        // create a token
        const token = Jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Set cookie and send response
        return res.cookie("token", token, { 
            maxAge: 1000 * 60 * 60, 
            secure: true, 
            httpOnly: true 
        }).status(200).json({ 
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error.message);
        return res.status(500).json({ message: 'Something went wrong during login.' });
    }
};
    


module.exports = { createUser, loginUser, getAllUsers, updateUser, deleteUser,  };
// This code defines the user controller functions for handling user-related operations
// such as creating, retrieving, updating, deleting users, and logging in users.s