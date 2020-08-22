const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creat UserSchema
const UserSchema = new Schema({
  nickname: {
    type: String
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
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
  gender: {
    type: String,
  }
});

module.exports = User = mongoose.model("user", UserSchema);
