const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    followers: [
        {
            type: ObjectId,
            ref: 'INSTAUSER'
        }
    ],
    following: [
        {
            type: ObjectId,
            ref: 'INSTAUSER'
        }
    ],
    photo: {
        type: String,

    }
})

mongoose.model("INSTAUSER", userSchema);