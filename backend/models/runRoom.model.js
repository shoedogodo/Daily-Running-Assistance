const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for RunRoom, where multiple runners can join
const RunRoomSchema = mongoose.Schema({
    runID: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    runners: [{
        username: { type: String, required: true },  // Runner's username
        nickname: { type: String, default: null },
        profile_pic: String, // Change this to String instead of ObjectId
        meters: { type: Number, default: 0 },
        seconds: { type: Number, default: 0 },
        latitude: { type: Number, default: 0, required: true },
        longitude: { type: Number, default: 0, required: true },
        running: { type: Boolean, default: false },
        markers: { type: [mongoose.Schema.Types.Mixed], default: [] },
        start: { type: Date, default: 0 },
        end: { type: Date, default: 0 },
        marathon_place: { type: String, default: 'N/A' },  // Runner's place in the race
        in_room: {type:Boolean, default: true, required: true},
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// RunRoom Schema pre-save hook to update the updatedAt field
RunRoomSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Creating the model for RunRoom
const RunRoom = mongoose.model('RunRoom', RunRoomSchema);

// Exporting the models
module.exports = {
    RunRoom
};
