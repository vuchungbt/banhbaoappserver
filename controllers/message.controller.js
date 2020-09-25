const MessageService = require("../services/message.service");

async function getMessages(request, response) {
  const { page,userId } = request.params;
  try {
    
    if(!page) {
      page=1;
    }
    
    const messages = await MessageService.getMessages({ page,userId });
    response.status(200).json({
      status: 200,
      messages: messages.reverse()
    });
  } catch (error) {
    console.log(error.message);
    response.status(error.statusCode || 500).json({ message: "get message failed" });
  }
}


module.exports = {
  getMessages
}