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
        const room = await RunRoom.findOne({ runID })
            .populate('runners.profile_pic')
            .lean();

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

const createRoom = async (req, res) => {}

const joinRoom = async (req, res) => {}

const leaveRoom = async (req, res) => {}

const updateRoom = async (req, res) => {}

const deleteRoom = async (req, res) => {}

module.exports = {
    getRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoom,
    deleteRoom,
}
