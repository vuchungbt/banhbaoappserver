const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creat UserSchema
const UserSchema = new Schema({
    nickname: {
        type: String
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
    },
    dob: {
        type: Date,
    },
    picture: {
        type: String,
    },
    gender: {
        type: String,
    },
    facebook_id: {
        type: String,
    },
    picture: {
        type: String,
    },
    heart: {
        type: Number,
        default: 0
    },
    report: {
        type: Number,
        default: 0
    },
    trading: {
        type: Number,
        default: 0
    },
    timeBlock: {
        type: Date,
        default: new Date()
    }
});

module.exports = User = mongoose.model("user", UserSchema);