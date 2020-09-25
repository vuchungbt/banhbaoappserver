const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  
  room_id: Schema.Types.ObjectId,
  content: String,
  type_message:{
    type:String,
    default: 'message'
  },
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
MessageSchema.statics.sendMessageToRoom = async function (receivedId,senderId,type_message, content, roomId) {
  const message = await MessageModel.create({
    userId: receivedId,
    type_message: type_message,
    sender: senderId,
    content: content,
    room_id: roomId,
    status: 'SENDED'
  });
  return message;
}
MessageSchema.statics.findHeartFromRoomId = async function (roomId,senderId) {
  const message = await MessageModel.findOne({sender:senderId, room_id : roomId , type_message : 'send-heart' });
  return message;
}

const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = MessageModel;