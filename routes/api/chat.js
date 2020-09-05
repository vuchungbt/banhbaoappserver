const config = require("config");
const jwt = require("jsonwebtoken");
const _ = require("lodash");


const RoomDetails = require("../../models/Database");
const MessageModel = require("../../models/Message");
const User = require("../../models/User");
const ALPHABET = "0123456789ABCDEFGHIKLMNOPQRSTUVWXYZ";

const decodedToken = token => jwt.verify(token, config.get("jwtSecret"));


const clients = [];
const rooms = [];

const connect = io => {
  io.on("connection", function (socket) {

    const token = socket.handshake.query.token;
    if (!token || token == "null" || token == "" || token == null || token == undefined) {
      console.log("token invalid:", token);
    }
    else {
      const { username, id } = decodedToken(token);

      socket.username = username;
      socket.userId = id;

      socket.on("find-partner", async (data) => {
        // lấy ngẫu nhiên trong hàng đợi 1 user để tạo room
        const userToCreateRoom = _.sample(clients);

        if (!userToCreateRoom || userToCreateRoom.userId === socket.userId) // ko co ai
        {
          let client = {
            socket: socket,
            username: socket.username,
            userId: socket.userId
          };
          clients.push(client);
        }
        else { // create room 

          // tạo phòng 
          _.remove(clients, client => client.userId === userToCreateRoom.userId);

          // findOrCreateRoomObject by memberIds
          const roomId = await RoomDetails.findRoomOrCreateOneWithMembers([userToCreateRoom.userId, socket.userId]);

          const room = {
            roomId: roomId
          };

          rooms.push(room);

          socket.join(room.roomId);

          userToCreateRoom.socket.join(room.roomId);

          io.to(room.roomId).emit('joined-to-room', room);
        }

        socket.on('send-message', async (message) => {
          // send message to room
          io.to(message.roomId).emit('new-message', message);
          // insert message to db
          const messageCreatedResult = await MessageModel.sendMessageToRoom(socket.userId, message.content, message.roomId);
        });

      });
    }

    socket.on("disconnect", reason => {
      console.log("disconnected", socket.username, socket.userId, socket.disconnected, reason);
    });
  });
};
module.exports = connect;