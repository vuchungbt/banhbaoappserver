const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  room_id: Schema.Types.ObjectId,
  content: String,
  status: String,
  created_at: {
    type: Date,
    default: Date.now,
  }
});

/**
 * @function sendMessageToRoom
 * @param senderId  ; id sender
 * @param content   ; content message
 * @param roomId    ; to room
 * @returns 
 */
MessageSchema.statics.sendMessageToRoom = async function (senderId, content, roomId) {
  const message = await MessageModel.create({
    sender: senderId,
    content: content,
    room_id: roomId,
    status: 'SENDED'
  });
  return message;
}


const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = MessageModel;