const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creat LinkSchema
const LinkSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
});

module.exports = Link = mongoose.model("link", LinkSchema);
