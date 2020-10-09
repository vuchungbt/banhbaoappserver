const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creat FeedbackSchema
const FeedbackSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    feedback: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    }
});

module.exports = Feedback = mongoose.model("feedback", FeedbackSchema);