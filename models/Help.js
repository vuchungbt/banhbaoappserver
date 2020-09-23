const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HelpSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: ""
    }
});

module.exports = Help = mongoose.model("Help", HelpSchema);