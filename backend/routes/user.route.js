const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const userController = require("../controllers/user.controller");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', userController.getUsers);
router.get('/:username', userController.getUser);

router.post('/', userController.registerUser);
router.post('/login', userController.loginUser);

router.put('/update', userController.updateUser);
router.delete('/delete', userController.deleteUser);

router.put('/update/nickname', userController.editNickname);
router.post('/update/profilepic', upload.single('profilePicture'), userController.uploadProfilePicture);
router.get('/profilepic/:username', userController.getProfilePicture);

module.exports = router;