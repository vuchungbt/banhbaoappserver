const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    userID: String,
    content: String,
    type:String,
    createAt: Number
  });
  
// hien 
  const messageSchema = mongoose.Schema({
    type: String,
    sender: String,
    sendTime: Date,
    roomId: String,
    content: String,
    status: String,
  });

  const roomSchema = mongoose.Schema({
    roomId: String,
    members: [String],
    imageUrl: String,
    name: String,
    status: Number,
    messages:[Object],
    createDate: {
      type: Date,
      default: Date.now,
    },
  });
//

const RoomDetailsSchema = new Schema({
  RoomID: {
    type: String,
    required: true
  },
  status:Number,
  messages: { type: [MessageSchema], default: [] }
});

module.exports = RoomDetails = mongoose.model( "RoomDetails", RoomDetailsSchema);

module.exports.MessageRespo = mongoose.model("message", messageSchema);
module.exports.RoomRespo = mongoose.model("room", roomSchema);
