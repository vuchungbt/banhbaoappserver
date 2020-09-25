const MessageModel = require("../models/Message");

/**
 * @function getMessageByRoomId
 * 
 * @param {ObjectId} roomId 
 * 
 * @returns messages
 */


function getMessages(page) {
  return MessageModel.find({ $or: [ { userId: page.userId }, { sender: page.userId } ] })
  .limit(50)
  .skip((page.number-1)*50)
  .sort( { _id: -1 } );
}

module.exports = {
  getMessages,
}