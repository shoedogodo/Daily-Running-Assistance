const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const userController = require("../controllers/user.controller");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// get user
router.get('/', userController.getUsers);
// get user by id (NOT USERNAME)
router.get('/:username', userController.getUser);

// register new user
router.post('/', userController.registerUser);
// login user
router.post('/login', userController.loginUser);

// update user details based on id
router.put('/update', userController.updateUser);
// delete user based on id
router.delete('/delete', userController.deleteUser);

// update user nickname
router.put('/update/nickname', userController.editNickname);

// update user profile picture
router.post('/update/profilepic', upload.single('profilePicture'), userController.uploadProfilePicture);
// get user profile picture
router.get('/profilepic/:username', userController.getProfilePicture);

// Run data routes
router.put('/run/data', userController.updateRunData);
router.post('/run/record', userController.saveRunRecord);
router.get('/run/data/:username', userController.getCurrentRunData);
router.get('/run/records/:username', userController.getRunRecords);
router.get('/run/records/:username/:recordId', userController.getRunRecordById);
router.put('/run/records/:username/:recordId', userController.updateRunRecord);
router.delete('/run/records/:username/:recordId', userController.deleteRunRecord);

module.exports = router;