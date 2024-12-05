const mongoose = require('mongoose');

// For individual running schema
const RunDataSchema = mongoose.Schema({
    meters: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 },
    latitude: { type: Number, default: 0, required: true },
    longitude: { type: Number, default: 0, required: true },
    running: { type: Boolean, default: false },
    markers: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Array of mixed type (can be any type of object)
    start: { type: Date, default:0, required: true },
    end: { type: Date, default:0, required: true }
});


const UserSchema = mongoose.Schema({
    username:{ type: String, required: [true, "Please enter username"]},
    password:{ type: String, required: [true, "Please enter password"]},

    nickname: { type: String, default: null },
    profilepic: { type: String, default: null }, // Assuming this is a URL or file path to the profile picture

    data: { type: RunDataSchema, default: {} }, // Embeds the dataSchema
    record: { type: [mongoose.Schema.Types.Mixed], default: [] } // Array of mixed type, can be any structure
});

const User = mongoose.model("User", UserSchema);
module.exports = User;