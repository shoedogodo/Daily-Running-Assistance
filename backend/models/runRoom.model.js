const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for RunRoom, where multiple runners can join
const RunRoomSchema = mongoose.Schema({
    runID: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    runners: [{
        username: { type: String, required: true },  // Runner's username
        nickname: { type: String, default: null },
        profile_pic: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files', default: null },
        distance_run: { type: Number, default: 0 },  // Runner's distance covered so far
        run_time: { type: Number, default: 0 },  // Elapsed run time (in seconds)
        markers: [{ 
            marker_name: { type: String },
            marker_time: { type: Date }
        }],
        marathon_place: { type: String, default: 'N/A' },  // Runner's place in the race
        time_entered_room: { type: Date, default: Date.now },
        time_exited_room: { type: Date },
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
