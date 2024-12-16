require('dotenv').config();
const mongoose = require('mongoose');
const { RunRoom } = require('../models/runRoom.model');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

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
        // Get runID from request body
        const { runID } = req.body;  // Changed from req.params to req.body

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
                    distance_run: runner.distance_run,
                    run_time: runner.run_time,
                    markers: runner.markers,
                    marathon_place: runner.marathon_place,
                    time_entered_room: runner.time_entered_room,
                    time_exited_room: runner.time_exited_room
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

const joinRoom = async (req, res) => { //profile picture doesnt load, nickname also shouldnt need input (should be automatic via username)
    try {
      const { runID, password, username, nickname } = req.body;
  
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
  
      // Check if the runner is already in the room
      const existingRunner = room.runners.find((runner) => runner.username === username);
      if (existingRunner) {
        return res.status(400).json({ error: 'Runner already in the room' });
      }
  
      // Fetch the profile picture from the API
      let profilePicId = null;
      try {
        const response = await fetch(`http://localhost:8000/api/users/profilepic/${username}`);
        const data = await response.json();
        profilePicId = data.profilePicId;
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        // You can choose to handle this error differently based on your requirements
        // For now, we'll proceed without the profile picture
      }
  
      // Add the runner to the room
      room.runners.push({
        username,
        nickname,
        profile_pic: profilePicId,
        time_entered_room: Date.now(),
      });
  
      // Save the updated room
      await room.save();
  
      res.status(200).json({ message: 'Joined room successfully', room });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).json({ error: 'An error occurred while joining the room' });
    }
  };

const leaveRoom = async (req, res) => {}

const updateRoom = async (req, res) => {
    try {
      const { runID, password, username } = req.body;
  
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
  
      // Update the runner's information
      if (req.body.nickname) {
        runner.nickname = req.body.nickname;
      }
      if (req.body.profile_pic) {
        runner.profile_pic = req.body.profile_pic;
      }
      if (req.body.distance_run) {
        runner.distance_run = req.body.distance_run;
      }
      if (req.body.run_time) {
        runner.run_time = req.body.run_time;
      }
      if (req.body.markers) {
        runner.markers = req.body.markers;
      }
      if (req.body.marathon_place) {
        runner.marathon_place = req.body.marathon_place;
      }
      if (req.body.time_exited_room) {
        runner.time_exited_room = req.body.time_exited_room;
      }
  
      // Save the updated room
      await room.save();
  
      res.status(200).json({ message: 'Room updated successfully', room });
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({ error: 'An error occurred while updating the room' });
    }
  };

const deleteRoom = async (req, res) => {}

module.exports = {
    getRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoom,
    deleteRoom,
}
