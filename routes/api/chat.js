const config = require("config");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const fs = require('fs');

const RoomDetails = require("../../models/Database");
const MessageModel = require("../../models/Message");
const {
    count
} = require("../../models/User");
const User = require("../../models/User");
const ALPHABET = "0123456789ABCDEFGHIKLMNOPQRSTUVWXYZ";

const decodedToken = token => jwt.verify(token, config.get("jwtSecret"));


const clients = []; // awating
//const rooms = [];

var data = fs.readFileSync("word.txt", {
    encoding: 'utf8',
    flag: 'r'
});
var words = data.split("\n");

const connect = io => {
    io.on("connection", function(socket) {
        console.log("connection");

        const token = socket.handshake.query.token;
        if (!token || token == "null" || token == "" || token == null || token == undefined) {
            console.log("token invalid:", token);
        } else {
            const {
                username,
                id
            } = decodedToken(token);

            socket.username = username;
            socket.userId = id;

            socket.on("find-partner", async(data) => {
                console.log('find partner Starting...');
                const r = await RoomDetails.findRoom(socket.userId);
                console.log('findRoom', r);

                if (r != null && r.status === 0) {
                    const room = {
                        roomId: r._id
                    };
                    console.log('reconect success when find-partner', room);
                    socket.join(room.roomId);

                    io.to(room.roomId).emit('joined-to-room', room);
                } else {
                    // lấy ngẫu nhiên trong hàng đợi 1 user để tạo room
                    const userToCreateRoom = _.sample(clients);

                    if (!userToCreateRoom || userToCreateRoom.userId === socket.userId) // ko co ai
                    {
                        console.log('no body - push mysefl');
                        let client = {
                            socket: socket,
                            username: socket.username,
                            userId: socket.userId
                        };
                        clients.push(client);
                    } else { // create room 
                        console.log('have one -> create room');
                        // tạo phòng 
                        _.remove(clients, client => client.userId === userToCreateRoom.userId);

                        // findOrCreateRoomObject by memberIds
                        const roomId = await RoomDetails.findRoomOrCreateOneWithMembers([userToCreateRoom.userId, socket.userId]);

                        const room = {
                            roomId: roomId
                        };

                        // rooms.push(room);

                        socket.join(room.roomId);

                        userToCreateRoom.socket.join(room.roomId);

                        io.to(room.roomId).emit('joined-to-room', room);

                    }
                }

            });
            // word cam


            socket.on('send-message', async(message) => {
                let socketId = message.socketId;
                message = message.msg
                    // send message to room
                message.username = username;
                io.to(message.roomId).emit('new-message', message);
                // insert message to db
                console.log('message: ', message);
                // find user's last message in the this room
                const messPre = await MessageModel.find({
                    sender: socket.userId,
                    roomId: message.roomId
                }).sort({
                    _id: -1
                }).limit(1);
                let count = 0;
                if (messPre.length != 0) {
                    count = messPre[0].count;
                    let contentArr = message.content.split(" ");
                    //check
                    for (let word of contentArr) {
                        if (words.includes(word)) {
                            count++;
                        }
                    }
                }
                if (count == 3) {
                    socket.to(socketId).emit("warning", "Bạn đã sử dụng 3 lần từ ngữ thô tục");
                }
                if (count == 5) {
                    socket.to(socketId).emit("warning", "Bạn đã sử dụng 4 lần từ ngữ thô tục");
                }
                if (count == 7) {
                    // cam dung 1h
                    count = 0;
                }
                const messageCreatedResult = await MessageModel.sendMessageToRoom(socket.userId, message.content, message.roomId, count);
            });

            socket.on('leave-room', async(roomId) => {

                const r = await RoomDetails.findOne({
                    roomId
                });
                if (r != null) {
                    r.status = 1;
                    r.save();
                    io.to(roomId).emit('partner-left', {
                        roomId
                    });
                    socket.leave(roomId);
                    console.log('leave done ', roomId);
                }

            });

            socket.on("reconnect", async(userId) => {

                const r = await RoomDetails.findRoom(socket.userId);
                if (r != null && r.status === 0) {
                    const room = {
                        roomId: r._id
                    };

                    socket.join(room.roomId);
                    console.log('reconnect success ', room);

                    io.to(room.roomId).emit('joined-to-room', room);
                }

            });
        }


        socket.on("disconnect", reason => {
            console.log("disconnected", socket.username, socket.userId, socket.disconnected, reason);
        });
    });
};
module.exports = connect;