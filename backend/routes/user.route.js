const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const {getUsers, getUser, registerUser, updateUser, deleteUser, loginUser} = require("../controllers/user.controller");

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', registerUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.post('/login', loginUser);


module.exports = router;