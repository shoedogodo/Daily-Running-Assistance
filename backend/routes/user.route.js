const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const {getUsers, getUser, registerUser, updateUser, deleteUser, loginUser,loginUserTest,tokenCheck,registerUserTest} = require("../controllers/user.controller");//ly

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', registerUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.post('/login', loginUser);

router.post('/loginTest', loginUserTest);//ly
router.post('/registerTest', registerUserTest);
router.post('/tokenCheck', tokenCheck);//


module.exports = router;
