require('dotenv').config();
const mongoose = require('mongoose');
const { User, Post, Comment } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// 获取环境变量中的密钥
//TODO:
const SECRET_KEY = process.env.SECRET_KEY;

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// API: Get all Users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// API: Get User based on username
const getUser = async (req, res) => {
    try {
        const { username } = req.params;  // Get username from request parameters

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);  // Return the found user

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // 记录用户的登录时间
        const loginTime = new Date();

        // Create a new user
        const newUser = await User.create({ username, password, nickname: username });

        // Set the default profile picture
        const defaultProfilePicture = path.join(__dirname, '../images/my-icon.png');
        const uploadStream = gfs.openUploadStream('default-profile-picture', {
            contentType: 'image/png'
        });

        // Read the default profile picture file and write it to GridFS
        const readStream = fs.createReadStream(defaultProfilePicture);
        readStream.pipe(uploadStream);

        // Wait for the upload stream to finish
        uploadStream.on('finish', async () => {
            // Update the user's profilePicture field with the default file ID
            newUser.profilePicture = uploadStream.id;
            await newUser.save();

            // Generate a token for the new user
            const token = jwt.sign({
                id: newUser._id,
                username: newUser.username,
                loginTime: loginTime.toISOString() // 将登录时间添加到token的payload中
            }, SECRET_KEY, {
                expiresIn: '2h' // 设置token过期时间
            });

            res.status(200).json({ message: "Register successful", token, newUser });
        });

        uploadStream.on('error', (error) => {
            console.error('Error uploading profile picture:', error);
            res.status(500).json({ message: 'Error uploading profile picture' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify the password
        const isPasswordValid = user.password === password; // Adjust if using hashed passwords
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // 记录用户的登录时间
        const loginTime = new Date();

        // Generate a token for the new user
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            loginTime: loginTime.toISOString() // 将登录时间添加到token的payload中
        }, SECRET_KEY, {
            expiresIn: '2h' // 设置token过期时间
        });

        // If valid, return success response
        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



const updateUser = async (req, res) => {
    try {
        const { username, password } = req.body;  // Assuming username and password are in the request body

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the password matches the user's existing password
        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // If the username and password are correct, proceed to update the user
        // Update user info based on the request body (excluding username and password)
        const updatedUser = await User.findOneAndUpdate({ username }, req.body, { new: true });

        res.status(200).json(updatedUser); // Return the updated user
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// API: delete a user based on username after verifying password
const deleteUser = async (req, res) => {
    try {
        const { username, password } = req.body;  // Get username and password from request body

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the password matches the user's existing password
        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // If the username and password are correct, proceed to delete the user
        await User.findOneAndDelete({ username });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// API: Edit User's nickname
const editNickname = async (req, res) => {
    try {
        const { username, nickname } = req.body;  // Assuming username and nickname are in the request body
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update the user's nickname
        user.nickname = nickname;
        await user.save();
        res.status(200).json({ message: "Nickname updated successfully", user });
        //console.log(nickname);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// API: Get User's nickname
const getNickname = async (req, res) => {
    try {
      const { username } = req.params; // Assuming username is passed as a URL parameter
  
      // Find the user by username
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ nickname: user.nickname });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        const { username } = req.body;
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: "User not found" });
        }

        // Delete old profile picture if it exists
        if (user.profilePicture) {
            try {
                await gfs.delete(new mongoose.Types.ObjectId(user.profilePicture));
            } catch (error) {
                console.log('Error deleting old profile picture:', error);
            }
        }

        // Create upload stream
        const uploadStream = gfs.openUploadStream(username + '-profile-picture', {
            contentType: req.file.mimetype
        });

        // Write file to GridFS
        uploadStream.end(req.file.buffer);

        // Update user's profilePicture field with the new file ID
        user.profilePicture = uploadStream.id;
        await user.save();

        res.status(200).json({ message: "Profile picture uploaded successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get profile picture
const getProfilePicture = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user || !user.profilePicture) {
            return res.status(404).json({ message: "Profile picture not found" });
        }

        // Create download stream
        const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(user.profilePicture));

        // Set the proper content type
        res.set('Content-Type', 'image/jpeg');

        // Pipe the file to the response
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const saveRunRecord = async (req, res) => {
    try {
        const { username, runRecord } = req.body;
        
        // Find and update atomically to prevent race conditions
        const user = await User.findOneAndUpdate(
            { username },
            { $inc: { lastRunId: 1 } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create new record with the incremented ID
        const newRecord = {
            ...runRecord,
            runId: user.lastRunId,
            timestamp: new Date()
        };

        // Add to records array and clear current run data
        await User.findOneAndUpdate(
            { username },
            {
                $push: { record: newRecord },
                $set: { data: {} }
            }
        );

        res.status(200).json({ 
            message: "Run record saved successfully", 
            record: newRecord 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get specific run record by ID
const getRunRecordById = async (req, res) => {
    try {
        const { username } = req.params;
        const recordId = parseInt(req.params.recordId);
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const record = user.record.find(r => r.runId === recordId);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Token检测函数
const tokenCheck = async (req, res) => {
    try {
      const token = req.headers['authorization']; // 假设token直接在authorization头部
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      // 移除Bearer前缀（如果存在）
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  
      // 验证token
      jwt.verify(cleanToken, SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Token is invalid or has expired" });
        }
  
        // Token验证成功，可以在这里添加额外的逻辑，例如返回用户信息
        res.status(200).json({ message: "Token is valid", decoded });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

// Get all run records
const getRunRecords = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optional: Add query parameters for pagination
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const records = user.record.slice(startIndex, endIndex);
        const total = user.record.length;

        res.status(200).json({
            records,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload current run data
const updateRunData = async (req, res) => {
    try {
        const { username, runData } = req.body;
        
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's current run data
        user.data = {
            ...user.data,
            ...runData,
        };

        await user.save();
        res.status(200).json({ message: "Run data updated successfully", data: user.data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current run data
const getCurrentRunData = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update run record
const updateRunRecord = async (req, res) => {
    try {
        const { username } = req.params;
        const recordId = parseInt(req.params.recordId);
        const updateData = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const recordIndex = user.record.findIndex(r => r.runId === recordId);
        if (recordIndex === -1) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Update the record while preserving the ID
        user.record[recordIndex] = {
            ...updateData,
            runId: recordId  // Preserve the original ID
        };

        await user.save();

        res.status(200).json({
            message: "Record updated successfully",
            record: user.record[recordIndex]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete run record
const deleteRunRecord = async (req, res) => {
    try {
        const { username } = req.params;
        const recordId = parseInt(req.params.recordId);
        
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const recordIndex = user.record.findIndex(r => r.runId === recordId);
        if (recordIndex === -1) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Remove the record
        user.record.splice(recordIndex, 1);

        // Reindex remaining records
        user.record = user.record.map((record, index) => ({
            ...record,
            runId: index + 1
        }));

        await user.save();

        res.status(200).json({
            message: "Record deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// send post
const createPost = async (req, res) => {
    try {
        const { title, content, username } = req.body;

        // 查找用户
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 处理上传的图片
        let imageIds = [];
        if (req.files && req.files.images) {
            // 如果有多个文件，req.files.images 将是一个数组
            // 如果只有一个文件，req.files.images 将是一个对象
            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

            for (const file of files) {
                // 创建上传流并获取文件ID
                const uploadStream = gfs.openUploadStream(username + '-post-image-' + Date.now(), {
                    contentType: file.mimetype
                });

                // 将文件缓冲区写入上传流
                uploadStream.end(file.buffer);

                // 将文件ID添加到数组中
                imageIds.push(uploadStream.id);
            }
        }
        
        // 创建帖子并保存到数据库
        const newPost = new Post({
            title: title,
            content: content,
            author: user._id, // 将帖子与用户关联
            images: imageIds // 将图片文件ID保存到帖子中
        });

        await newPost.save();
        user.posts.push(newPost._id);
        await user.save();
        
        return res.status(201).json({ message: "Post created successfully",post: newPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPosts = async (req, res) => {
    try {
        // 查询数据库中的所有帖子
        const posts = await Post.find({}).populate('author', 'username'); // 假设我们需要返回作者的username

        // 如果没有找到帖子，返回404状态
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: "No posts found" });
        }

        // 返回所有帖子
        res.status(200).json({ message: "Posts retrieved successfully", posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPostById = async (req, res) => {
    try {
        // 从请求参数中获取postId
        const { postId } = req.params;

        const post = await Post.findOne({ postId: postId });
        // 如果没有找到帖子，返回404状态
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // 如果找到了帖子，返回200状态和帖子数据
        res.status(200).json({ message: "Post retrieved successfully", post });
    } catch (error) {
        // 如果发生错误，返回500状态和错误消息
        res.status(500).json({ message: error.message });
    }
};

const getPostByUsername = async (req, res) => {
    try {
        // 从请求参数中获取用户名
        const { username } = req.params;

        // 查找具有指定用户名的用户
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 查找所有属于该用户的帖子，并填充作者信息
        const posts = await Post.find({ author: user._id }).populate('author', 'username');

        // 返回帖子列表
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        // 从请求参数中获取postId
        const postId = req.params.postId;

        // 从请求体中获取更新数据
        const { title, content} = req.body;

        // 查询数据库中的帖子
        const post = await Post.findOne({ postId: postId });

        if (!post) {
            // 如果帖子不存在，返回404状态和错误消息
            return res.status(404).json({ message: 'Post not found' });
        }

        // 更新帖子的字段
        post.title = title;
        post.content = content;
        //post.images = images; // 假设images是一个数组或者适当的字段格式
        
        // 清空帖子当前的图片
        if (post.images && post.images.length > 0) {
            // 假设post.images存储的是文件ID数组
            // 删除存储在GridFS中的图片文件
            for (const imageId of post.images) {
                await gfs.delete(imageId);
            }
        }

        // 处理上传的图片
        let imageIds = [];
        if (req.files && req.files.images) {
            // 如果有多个文件，req.files.images 将是一个数组
            // 如果只有一个文件，req.files.images 将是一个对象
            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

            for (const file of files) {
                // 创建上传流并获取文件ID
                const uploadStream = gfs.openUploadStream(username + '-post-image-' + Date.now(), {
                    contentType: file.mimetype
                });

                // 将文件缓冲区写入上传流
                uploadStream.end(file.buffer);

                // 将文件ID添加到数组中
                imageIds.push(uploadStream.id);
            }
        }

        // 更新帖子的图片数组
        post.images = imageIds;
        
        // 保存更新后的帖子到数据库
        await post.save();

        // 返回更新后的帖子
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deletePost = async (req, res) => {
    try {
        // 从请求参数中获取postId
        const postId = req.params.postId;

        // 使用自定义的postId字段来查找帖子
        const post = await Post.findOne({ postId: postId });

        if (!post) {
            // 如果没有找到帖子，返回404状态
            return res.status(404).json({ message: 'Post not found' });
        }

        // 删除帖子中的所有评论
        await Comment.deleteMany({ _id: { $in: post.comments } });

        // 获取帖子的作者_id
        const authorId = post.author;

        // 从用户的posts数组中移除该帖子的_id
        await User.updateOne(
        { _id: authorId },
        { $pull: { posts: post._id } }
        );

        // 如果帖子包含图片，也需要从GridFS中删除这些图片
        if (post.images && post.images.length > 0) {
            for (const imageId of post.images) {
                // 删除GridFS中的图片
                await gfs.delete(imageId);
            }
        }

        // 删除帖子
        await Post.deleteOne({ _id: post._id });
        
        // 如果帖子被成功删除，返回成功消息
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        // 如果发生错误，返回500状态和错误消息
        res.status(500).json({ message: error.message });
    }
};


const createComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        // 从请求体中获取数据
        const {content, username } = req.body;

        // 查找用户，这里假设你有一个 User 模型并且可以通过用户名找到用户
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 查找具有指定 postId 的帖子
        const post = await Post.findOne({ postId: postId });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 创建新的评论
        const newComment = new Comment({
            content: content,
            author: user._id, // 使用用户的 _id 作为评论的作者
            post: post._id, // 使用帖子的 _id 关联评论
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 保存评论
        await newComment.save();

        // 将评论的 _id 添加到帖子的 comments 数组中
        post.comments.push(newComment._id);
        await post.save();

        // 返回成功消息和新的评论
        res.status(200).json({
            message: 'Comment created successfully',
            comment: newComment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getCommentsByPostId = async (req, res) => {
    try {
        // 假设从请求参数中获取postId
        const { postId } = req.params;

        // 查找具有指定postId的帖子
        const post = await Post.findOne({ postId: postId }).populate('comments');

        if (!post) {
            // 如果帖子不存在，则返回404错误
            return res.status(404).json({ message: 'Post not found' });
        }

        // 返回评论数组
        res.status(200).json(post.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        // 从请求参数中获取 commentId
        const { commentId } = req.params;

        // 查找并删除具有指定 commentId 的评论
        const deletedComment = await Comment.findOneAndDelete({ commentId: commentId });

        // 如果没有找到评论，则返回404错误
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // 从帖子中移除该评论的引用
        await Post.updateOne(
            { postId: deletedComment.postId },
            { $pull: { comments: deletedComment._id } }
        );

        // 返回成功删除的评论信息
        res.status(200).json({ message: 'Comment deleted successfully', comment: deletedComment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

const likePost = async (req, res) => {
    try {
      // 从请求参数中获取 postID
      const postID = req.params.postID;
  
      // 查找具有指定 postID 的帖子并增加点赞数
      const post = await Post.findOneAndUpdate(
        { postId: postID }, // 查询条件，使用自定义的 postId 字段
        { $inc: { likes: 1 } }, // 使用$inc 操作符来增加 likes 字段的值
        { new: true, useFindAndModify: false } // 返回更新后的文档，不使用过时的 findAndModify
      );
  
      // 如果帖子不存在，返回404状态码和错误消息
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // 返回200状态码和更新后的帖子信息
      res.status(200).json({ message: 'Post liked successfully', post });
    } catch (error) {
      // 如果发生错误，返回500状态码和错误消息
      res.status(500).json({ message: error.message });
    }
  };
  

const unlikePost = async (req, res) => {
    try {
        // 从请求参数中获取 postID
        const postID = req.params.postID;

        // 查找具有指定 postID 的帖子并减少点赞数
        const post = await Post.findOneAndUpdate(
            { postId: postID }, // 查询条件，使用自定义的 postId 字段
            { $inc: { likes: -1 } }, // 使用$inc 操作符来减少 likes 字段的值
            { new: true, useFindAndModify: false } // 返回更新后的文档，不使用过时的 findAndModify
        );

        // 如果帖子不存在，返回404状态码和错误消息
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 返回200状态码和更新后的帖子信息
        res.status(200).json({ message: 'Post unliked successfully', post });
    } catch (error) {
        // 如果发生错误，返回500状态码和错误消息
        res.status(500).json({ message: error.message });
    }
};
  
const likeComment = async (req, res) => {
    try {
      // 从请求参数中获取 commentId
      const commentId = req.params.commentId;
  
      // 查找具有指定 commentId 的评论并增加点赞数
      const comment = await Comment.findOneAndUpdate(
        { commentId: commentId }, // 查询条件，使用 MongoDB 默认的 _id 字段
        { $inc: { likes: 1 } }, // 使用$inc 操作符来增加 likes 字段的值
        { new: true, useFindAndModify: false } // 返回更新后的文档，不使用过时的 findAndModify
      );
  
      // 如果评论不存在，返回404状态码和错误消息
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      // 返回200状态码和更新后的评论信息
      res.status(200).json({ message: 'Comment liked successfully', comment });
    } catch (error) {
      // 如果发生错误，返回500状态码和错误消息
      res.status(500).json({ message: error.message });
    }
};

const unlikeComment = async (req, res) => {
    try {
      // 从请求参数中获取 commentId
      const commentId = req.params.commentId;
  
      // 查找具有指定 commentId 的评论并减少点赞数
      const comment = await Comment.findOneAndUpdate(
        { commentId: commentId }, // 查询条件，使用 MongoDB 默认的 _id 字段
        { $inc: { likes: -1 }}, // 使用$inc 操作符来减少 likes 字段的值
        { new: true, useFindAndModify: false } // 返回更新后的文档，不使用过时的 findAndModify
      );
  
      // 如果评论不存在，返回404状态码和错误消息
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      // 返回200状态码和更新后的评论信息
      res.status(200).json({ message: 'Comment unliked successfully', comment });
    } catch (error) {
      // 如果发生错误，返回500状态码和错误消息
      res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUser, //deprecated
    
    registerUser,
    loginUser,

    updateUser, // deprecated
    deleteUser,

    tokenCheck,

    editNickname,
    getNickname,

    uploadProfilePicture,
    getProfilePicture,

    updateRunData, // updating CURRENT run data
    getCurrentRunData, // getting CURRENT run data

    saveRunRecord, // saving into run list
    getRunRecordById, // getting specific run record
    updateRunRecord, // updating run data
    deleteRunRecord, // deleting individual run record
    getRunRecords, // get all run records

    createPost,
    getPosts,
    getPostById,
    getPostByUsername,
    updatePost,
    deletePost,

    createComment,
    getCommentsByPostId,
    deleteComment,

    likePost,
    unlikePost,
    likeComment,
    unlikeComment
}
