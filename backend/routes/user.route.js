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

// check token
router.post('/tokenCheck', userController.tokenCheck);

// update user details based on id
router.put('/update', userController.updateUser);
// delete user based on id
router.delete('/delete', userController.deleteUser);

// update user nickname
router.put('/update/nickname', userController.editNickname);
router.get('/nickname/:username', userController.getNickname);

// update user profile picture
router.post('/update/profilepic', upload.single('profilePicture'), userController.uploadProfilePicture);
// get user profile picture
router.get('/profilepic/:username', userController.getProfilePicture);

// Run data routes
router.put('/run/data', userController.updateRunData); // update CURRENT run data
router.get('/run/data/:username', userController.getCurrentRunData); // get CURRENT run data

router.post('/run/record', userController.saveRunRecord); // update entire run log
//router.put('/run/records/:username/:recordId', userController.updateRunRecord); // update run record by id
router.get('/run/records/:username', userController.getRunRecords); // get all run records
router.get('/run/records/:username/:recordId', userController.getRunRecordById); // get run record by id
router.delete('/run/records/:username/:recordId', userController.deleteRunRecord); // delete run record by id

// 创建帖子
router.post('/share/posts', userController.createPost);
// 获取帖子列表
router.get('/share/posts', userController.getPosts);
// 获取单个帖子
router.get('/share/posts/:postId', userController.getPostById);
// 获取用户的帖子
router.get('/share/:username/posts', userController.getPostByUsername);
// 更新帖子
router.put('/share/posts/:postId', userController.updatePost);
// 删除帖子
router.delete('/share/posts/:postId', userController.deletePost);
// 创建评论
router.post('/share/posts/:postId/comments', userController.createComment);
// 获取评论列表
router.get('/share/posts/:postId/comments', userController.getCommentsByPostId);
// 删除评论
router.delete('/share/comments/:commentId', userController.deleteComment);
// 点赞帖子
router.post('/share/posts/:postId/likePost', userController.likePost);
//取消点赞帖子
router.post('/share/posts/:postId/unlikePost', userController.unlikePost);

// 点赞评论
router.post('/share/posts/:commentId/likeComment', userController.likeComment);

// 取消点赞帖子
router.post('/share/posts/:commentId/unlikeComment', userController.unlikeComment);

module.exports = router;
