const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const {getUsers, getUser, registerUser, updateUser, deleteUser, loginUser, updateProfilePicture, editNickname} = require("../controllers/user.controller");

router.get('/', getUsers);
router.get('/:username', getUser);

router.post('/', registerUser);
router.post('/login', loginUser);

router.put('/update', updateUser);
router.delete('/delete', deleteUser);

router.put('/update/profilePicture/', updateProfilePicture);
router.put('/update/nickname', editNickname);

module.exports = router;