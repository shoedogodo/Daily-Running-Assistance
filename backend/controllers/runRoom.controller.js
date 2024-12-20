require('dotenv').config();
const mongoose = require('mongoose');
const { RunRoom } = require('../models/runRoom.model');
const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const serverURL = "http://124.221.96.133:8000"; //for deployment testing
//const serverURL = "http://localhost:8000"; //for local testing

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

const getRoom = async (req, res) => {
  try {
      // Get runID from query string
      const { runID } = req.params;

      // Validate runID
      if (!runID) {
          return res.status(400).json({
              success: false,
              code: 'MISSING_RUNID',
              message: 'Run ID is required'
          });
      }

      // Find the room and populate profile pictures for runners
      const room = await RunRoom.findOne({ runID });

      // Check if room exists
      if (!room) {
          return res.status(404).json({
              success: false,
              code: 'ROOM_NOT_FOUND',
              message: 'Run room not found'
          });
      }

      // Return success response with room data
      return res.status(200).json({
          success: true,
          code: 'ROOM_FOUND',
          message: 'Run room retrieved successfully',
          data: {
              runID: room.runID,
              runners: room.runners.map(runner => ({
                  username: runner.username,
                  nickname: runner.nickname,
                  profile_pic: runner.profile_pic,
                  meters: runner.meters,
                  seconds: runner.seconds,
                  latitude: runner.latitude,
                  longitude: runner.longitude,
                  running: runner.running,
                  markers: runner.markers,
                  start: runner.start,
                  end: runner.end,
                  marathon_place: runner.marathon_place,
                  in_room: runner.in_room,
              })),
              createdAt: room.createdAt,
              updatedAt: room.updatedAt
          }
      });

  } catch (error) {
      console.error('Error in getRoom:', error);
      return res.status(500).json({
          success: false,
          code: 'SERVER_ERROR',
          message: 'An internal server error occurred'
      });
  }
};

const getAllRooms = async (req, res) => {
  try {
      // Fetch all rooms from the database
      const rooms = await RunRoom.find();

      // Check if there are no rooms
      if (rooms.length === 0) {
          return res.status(404).json({ message: "No rooms found." });
      }

      res.status(200).json({
          message: "Rooms retrieved successfully.",
          rooms,
      });
  } catch (error) {
      console.error("Error in getAllRooms:", error);
      res.status(500).json({ error: "Internal server error." });
  }
};

const createRoom = async (req, res) => {
    try {
      const { runID, password } = req.body;
  
      // Check if the room already exists
      const existingRoom = await RunRoom.findOne({ runID });
      if (existingRoom) {
        return res.status(400).json({ error: 'Room already exists' });
      }
  
      // Create a new room
      const newRoom = new RunRoom({
        runID,
        password,
        runners: [],
      });
  
      // Save the new room to the database
      await newRoom.save();
  
      res.status(201).json({ message: 'Room created successfully', room: newRoom });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ error: 'An error occurred while creating the room' });
    }
};

const joinRoom = async (req, res) => {
  try {
    const { runID, password, username , longitude, latitude} = req.body;

    // Find the room by runID
    const room = await RunRoom.findOne({ runID });

    // Check if the room exists
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if the provided password matches the room's password
    if (room.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const doesUserExist = await User.findOne({ username });
    if (!doesUserExist) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the runner is already in the room
    const existingRunner = room.runners.find((runner) => runner.username === username);
    if (existingRunner) {
      res.status(200).json({ message: 'Joined room successfully', room });
      return;
    }

    // Fetch the user's nickname from the API
    let nickname = null;
    try {
      const response = await fetch(`http://localhost:8000/api/users/nickname/${username}`);
      const data = await response.json();
      nickname = data.nickname;
    } catch (error) {
      console.error('Error fetching user nickname:', error);
      nickname = username;
    }

    // Fetch the user's profile picture URL from the API
    let profile_pic = null;
    try {
      const response = await fetch(`http://localhost:8000/api/users/profilepic/${username}`);
      if (response.ok) {
        const blob = await response.blob();
        profile_pic = URL.createObjectURL(blob);
      } else {
        console.error('Error fetching user profile picture:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user profile picture:', error);
    }

    // Add the runner to the room
    room.runners.push({
      username,
      nickname,
      //time_entered_room: Date.now(),
      profile_pic,
      longitude,
      latitude,
    });

    // Save the updated room
    await room.save();

    // Fetch the profile picture URLs for all users in the room
    const updatedRunners = await Promise.all(
      room.runners.map(async (runner) => {
        let runnerProfilePic = null;
        try {
          const response = await fetch(`http://localhost:8000/api/users/profilepic/${runner.username}`);
          if (response.ok) {
            const blob = await response.blob();
            runnerProfilePic = URL.createObjectURL(blob);
          }
        } catch (error) {
          console.error(`Error fetching profile picture for user ${runner.username}:`, error);
        }
        return {
          ...runner.toObject(),
          profile_pic: runnerProfilePic, // Assign the URL string directly
        };
      })
    );

    // Update the room with the fetched profile picture URLs
    room.runners = updatedRunners;

    // Send the updated room information to all connected users
    // (assuming you have a way to broadcast the update, e.g., using Socket.IO)
    //io.to(runID).emit('roomUpdate', room);

    res.status(200).json({ message: 'Joined room successfully', room });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'An error occurred while joining the room' });
  }
};

const leaveRoom = async (req, res) => {
  try {
      const { runID, username, password } = req.body;

      // Ensure all required fields are provided
      if (!runID || !username || !password) {
          return res.status(400).json({ error: "runID, username, and password are required." });
      }

      // Find the room by runID
      const room = await RunRoom.findOne({ runID });

      // Check if the room exists
      if (!room) {
          return res.status(404).json({ error: "RunRoom not found." });
      }

      // Validate the password
      if (room.password !== password) {
          return res.status(403).json({ error: "Invalid password for the room." });
      }

      // Update the runner's in_room status to false
      const updatedRoom = await RunRoom.findOneAndUpdate(
          { runID, "runners.username": username },
          { $set: { "runners.$.in_room": false } },
          { new: true } // Return the updated document
      );

      // Check if the runner was found
      if (!updatedRoom) {
          return res.status(404).json({ error: "Runner not found in the specified room." });
      }

      res.status(200).json({
          message: `Runner ${username} has left the room.`,
          updatedRoom,
      });
  } catch (error) {
      console.error("Error in leaveRoom:", error);
      res.status(500).json({ error: "Internal server error." });
  }
};


const updateRoom = async (req, res) => {
  try {
      const { runID, password, username, longitude, latitude } = req.body;

      // Validate required fields
      if (!runID || !password || !username || longitude === undefined || latitude === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      // Find the room by runID
      const room = await RunRoom.findOne({ runID });

      // Check if the room exists
      if (!room) {
          return res.status(404).json({ error: 'Room not found' });
      }

      // Check if the provided password matches the room's password
      if (room.password !== password) {
          return res.status(401).json({ error: 'Invalid password' });
      }

      // Find the runner in the room
      const runner = room.runners.find((runner) => runner.username === username);

      // Check if the runner exists in the room
      if (!runner) {
          return res.status(404).json({ error: 'Runner not found in the room' });
      }

      // Update the runner's longitude and latitude
      runner.longitude = longitude;
      runner.latitude = latitude;

      // Save the updated room
      await room.save();

      res.status(200).json({ message: 'Room updated successfully', room });
  } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({ error: 'An error occurred while updating the room' });
  }
};

const deleteRoom = async (req, res) => {
    try {
        const { runID, password } = req.body;

        // Ensure both runID and password are provided
        if (!runID || !password) {
            return res.status(400).json({ error: "runID and password are required." });
        }

        // Find the room by runID
        const room = await RunRoom.findOne({ runID });

        // Check if the room exists
        if (!room) {
            return res.status(404).json({ error: "RunRoom not found." });
        }

        // Validate the password
        if (room.password !== password) {
            return res.status(403).json({ error: "Invalid password for the room." });
        }

        // Delete the room
        await RunRoom.deleteOne({ runID });

        res.status(200).json({
            message: `RunRoom with ID ${runID} has been deleted successfully.`,
        });
    } catch (error) {
        console.error("Error in deleteRoom:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    getRoom,
    getAllRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoom,
    deleteRoom,
}
