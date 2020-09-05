const MessageModel = require("../models/Message");

/**
 * @function getMessageByRoomId
 * 
 * @param {ObjectId} roomId 
 * 
 * @returns messages
 */


function getMessagesByRoomId(roomId) {
  return MessageModel.find({ room_id : roomId });
}

module.exports = {
  getMessagesByRoomId,
}