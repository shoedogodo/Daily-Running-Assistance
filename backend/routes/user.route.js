const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const {getUsers, getUser, createUser, updateUser, deleteUser} = require("../controllers/user.controller");

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;