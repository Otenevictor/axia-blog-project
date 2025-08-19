const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const mongoose = require('mongoose');

// Importing the user routes
const userRoutes = require('./routes/user.route');
const blogRoutes = require('./routes/blogpost.route');
const commentRoutes = require('./routes/comment.route');


// Create connection to the database
mongoose.connect(process.env.MONGO_URL,) // Modified line
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

// Middleware to parse JSON bodies
app.use(express.json());

const port = process.env.PORT || 2000; // Use PORT from environment variables or default to 6000

app.use(cookieParser());

// Connecting endpoints for user database manipulation
app.use(userRoutes);
app.use(blogRoutes);
app.use(commentRoutes); 


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
