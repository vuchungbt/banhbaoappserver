const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creat AdminSchema
const AdminSchema = new Schema({

    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: String,
        default:'admin'
    }
});

module.exports = User = mongoose.model("admin", AdminSchema);