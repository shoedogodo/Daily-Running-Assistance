const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sequence = require('mongoose-sequence')(mongoose);

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

// commentSchema
const CommentSchema = new mongoose.Schema({
    //commentId: Number,
    commentId: { type: Number, unique: true },
    content: { type: String, required: [true, "Please enter a comment"] },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post'}, 
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

//PostSchema
const PostSchema = mongoose.Schema({
    postId: { type: Number, unique: true },
    title: { type: String, required: [true, "Please enter a title"] },
    content: { type: String, required: [true, "Please enter content"] },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    images: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'uploads.files' 
    }],
    
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const UserSchema = mongoose.Schema({
    username: { type: String, required: [true, "Please enter username"] },
    password: { type: String, required: [true, "Please enter password"] },
    nickname: { type: String, default: function() { return this.username; } },
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
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
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

// 应用sequence插件来生成自增的postId
PostSchema.plugin(sequence, { id: 'post_id_counter', inc_field: 'postId' });
CommentSchema.plugin(sequence, { id: 'commenet_id_counter', inc_field: 'commentId' });


const User = mongoose.model("User", UserSchema);
const Comment = mongoose.model('Comment', CommentSchema);
const Post = mongoose.model('Post', PostSchema);

// 导出模型
module.exports = {
    User,
    Post,
    Comment
};