const express = require("express");
const User = require("../models/user.model");
const router = express.Router();

const runRoomController = require("../controllers/runRoom.controller");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', runRoomController.getRoom);
router.post('/create', runRoomController.createRoom);
router.post('/join', runRoomController.joinRoom);
router.post('/leave', runRoomController.leaveRoom);
router.post('/update', runRoomController.updateRoom);
router.delete('/delete', runRoomController.deleteRoom);

module.exports = router;
