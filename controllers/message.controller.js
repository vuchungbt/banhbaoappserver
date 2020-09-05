const MessageService = require("../services/message.service");

async function getMessagesByRoomId(request, response) {
  const { roomId } = request.params;
  try {
    const messages = await MessageService.getMessagesByRoomId(roomId);
    response.status(200).json({
      status: 200,
      messages: messages
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({ message: error.message });
  }
}


module.exports = {
  getMessagesByRoomId
}