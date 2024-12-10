const mongoose = require('mongoose');

// For individual running schema
const RunDataSchema = mongoose.Schema({
    meters: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 },
    latitude: { type: Number, default: 0, required: true },
    longitude: { type: Number, default: 0, required: true },
    running: { type: Boolean, default: false },
    markers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    start: { type: Date, default: 0 },
    end: { type: Date, default: 0 }
});

const UserSchema = mongoose.Schema({
    username: { type: String, required: [true, "Please enter username"] },
    password: { type: String, required: [true, "Please enter password"] },
    nickname: { type: String, default: null },
    profilePicture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'uploads.files',
        default: null
    },
    lastRunId: { type: Number, default: 0 },
    data: { type: RunDataSchema, default: {} },
    record: { 
        type: [{
            runId: Number,
            meters: { type: Number, default: 0 },
            seconds: { type: Number, default: 0 },
            markers: { type: [mongoose.Schema.Types.Mixed], default: [] },
            start: Date,
            end: Date,
            timestamp: { type: Date, default: Date.now }
        }], 
        default: [] 
    }
});

// Keep the existing toJSON transform
UserSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;