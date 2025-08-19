const express = require('express');
const { authentication, adminAuth } = require('../auth.middleware/auth.middleware.js');
const { createUser, loginUser, getAllUsers,  updateUser, deleteUser } = require('../controllers/user.controller.js');
const route = express.Router(); // Create an Express Router instance
const upload = require('../utils/multer.js'); 




// Define routes for User operations
route.post('/user/register', createUser);
route.post('/user/login', loginUser);
// Protected routes
route.get('/user/allusers', authentication, adminAuth, getAllUsers);
route.put('/user/update', authentication, updateUser);
route.delete('/user/delete', authentication, deleteUser);


module.exports = route;
