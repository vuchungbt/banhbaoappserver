const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creat LinkSchema
const ResetPasschema = new Schema({
    userId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    enCode: {
        type: String,
        required: true
    },
    create_at: {
        type: Date,
        default: new Date()
    }
});

module.exports = Link = mongoose.model("resetPass", ResetPasschema);