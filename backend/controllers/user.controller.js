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
/*
// 假设的函数，用于将图片上传到云存储服务并返回URL
async function uploadToCloudStorage(file) {
    // 这里应该实现上传文件到云存储的逻辑
    // 返回图片在云存储服务上的URL
    // 以下为伪代码
    const imageUrl = `https://your-cloud-storage-service.com/${file.filename}`;
    return imageUrl;
  }

// send post
const sendPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const images = req.files;

            // 上传图片并获取图片URLs
        const imageUrls = await Promise.all(images.map(async (file) => {
        const imageUrl = await uploadToCloudStorage(file);
        return imageUrl;
        }));

            // 创建帖子并保存到数据库
        const newPost = new Post({
        title: title,
        content: content,
        images: imageUrls // 存储图片URLs
        });

        await newPost.save();
        
        return res.status(201).json({ message: "Post created successfully",post: newPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
*/

// send post
const sendPost = async (req, res) => {
    try {
        const { title, content, username } = req.body;

        // 查找用户
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 创建帖子并保存到数据库
        const newPost = new Post({
        title: title,
        content: content,
        author: user._id // 将帖子与用户关联
        });

        await newPost.save();
        user.posts.push(newPost._id);
        await user.save();
        
        return res.status(201).json({ message: "Post created successfully",post: newPost });
    } catch (error) {
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

    sendPost

}
