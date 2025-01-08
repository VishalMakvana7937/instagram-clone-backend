const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    postedBy: {
        type: ObjectId,
        ref: 'INSTAUSER'
    },
    likes: [{
        type: ObjectId,
        ref: 'INSTAUSER'
    }],
    comments: [{
        comment: { type: String },
        postedBy: { type: ObjectId, ref: "INSTAUSER" }
    }],
}, { timestamps: true });

mongoose.model("POST", postSchema)