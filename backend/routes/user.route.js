const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const {getUsers, getUser, registerUser, updateUser, deleteUser, loginUser} = require("../controllers/user.controller");

router.get('/', getUsers);
router.get('/:username', getUser);

router.post('/', registerUser);
router.post('/login', loginUser);

router.put('/update', updateUser);
router.delete('/delete', deleteUser);


module.exports = router;