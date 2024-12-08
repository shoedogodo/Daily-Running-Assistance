const User = require('../models/user.model'); 

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
        const newUser = await User.create({ username, password, nickname: username});
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

const updateProfilePicture = async (req, res) => {
    try {
        const { username } = req.params;  // Get username from request parameters

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Handle file upload
        upload.single('profilePicture')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            // Create a write stream to GridFS
            const writestream = gfs.createWriteStream({
                filename: `${Date.now()}-${req.file.originalname}`,
                content_type: req.file.mimetype
            });

            // Write the file buffer to GridFS
            writestream.write(req.file.buffer);
            writestream.end();

            writestream.on('close', async (file) => {
                // Update the user's profile picture with the file ID
                user.profilePicture = file._id;
                await user.save();

                res.status(200).json({ message: "Profile picture updated successfully", user });
            });

            writestream.on('error', (err) => {
                res.status(500).json({ message: err.message });
            });
        });
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

module.exports = {
    getUsers,
    getUser,
    registerUser,
    updateUser,
    deleteUser,
    loginUser,
    updateProfilePicture,
    editNickname
}