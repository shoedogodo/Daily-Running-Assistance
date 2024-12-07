const User = require('../models/user.model'); 
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'secret_key'; 

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


// API: Register a new User, load in JSON body
const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Create a new user
        const newUser = await User.create({ username, password});
        res.status(200).json(newUser);
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

        // If valid, return success response
        res.status(200).json({ message: "Login successful", user });
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



const registerUserTest = async (req, res) => {
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
        const newUser = await User.create({ username, password });

        // Generate a token for the new user
        const token = jwt.sign({
            id: newUser._id,
            username: newUser.username,
            loginTime: loginTime.toISOString() // 将登录时间添加到token的payload中
        }, SECRET_KEY, {
            expiresIn: '30min' // 设置token过期时间
        });
        
        res.status(200).json({ message: "Login successful", token , newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const loginUserTest = async (req, res) => {
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
            expiresIn: '30min' // 设置token过期时间
        });
        
        // If valid, return success response
        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error(error);
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

module.exports = {
    getUsers,
    getUser,
    registerUser,
    updateUser,
    deleteUser,
    loginUser,

    loginUserTest,
    registerUserTest,
    tokenCheck
}
