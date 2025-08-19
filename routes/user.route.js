const express = require('express');
const { authentication, adminAuth } = require('../auth.middleware.js/auth.middleware.js');
const { createUser, loginUser, getAllUsers,  updateUser, deleteUser } = require('../controllers/user.controller.js');
const route = express.Router(); // Create an Express Router instance
const upload = require('../utils/multer.js'); 




// Define routes for User operations
route.post('/register', createUser);
route.post('/login', loginUser);
// Protected routes
route.get('/all', authentication, adminAuth, getAllUsers);
route.put('/update', authentication, updateUser);
route.delete('/delete', authentication, deleteUser);


module.exports = route;
