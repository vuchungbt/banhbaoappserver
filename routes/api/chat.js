const config = require("config");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const fs = require("fs");

var serverKey = config.get('ServerKey');
var serviceAccount = require("../../config/servicesAccountKey.json");
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const RoomDetails = require("../../models/Database");
const MessageModel = require("../../models/Message");
const User = require("../../models/User");
const {
    log
} = require("console");


const decodedToken = token => jwt.verify(token, config.get("jwtSecret"));

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
};

const clients = []; // awating
let number = 0;
var data = fs.readFileSync("xref.txt", {
    encoding: 'utf8',
    flag: 'r'
});
var words = data.replace(/(\r\n|\n|\r)/gm, "|").split("|");
const connect = io => {
    
    io.on("connection", function(socket) {
        // number++;
        // socket.emit("userActive", number);
        console.log(number);
        console.log("connection");

        const token = socket.handshake.query.token;
        
        console.log(token);
        if (!token || token == "null" || token == "" || token == null || token == undefined) {
            console.log("token invalid:", token);
        } else {
            const {
                username,
                id,
                token_device
            } = decodedToken(token);
            console.log('========Chatt:ID===', id);
            console.log('========Chatt:username===', username);
            console.log('========Chatt:token_device===', token_device);
            socket.username = username;
            socket.userId = id;

            socket.token_device = token_device ;


            socket.on("find-partner", async(data) => {
                console.log(data);
                console.log("find");
                let user = await User.findById({
                    _id: socket.userId
                });
                let time = new Date();
                if (user.timeBlock > time) {
                    socket.to(socket.id).emit("blocking", "blocking");
                    console.log("user be blocked");
                    return;
                }
                console.log('find partner starting...');
                

                const r = await RoomDetails.findRoomActive(socket.userId);
                console.log('findRoom :', r);

                if (r != null && r.status === 0) {

                    const trading = r.members.find(element => element != socket.userId);
                    console.log('myID >', socket.userId);
                    console.log('partnerID >', trading);
                    const room = {
                        roomId: r._id,
                        userId: trading,
                    };
                    socket.join(room.roomId);
                    io.to(room.roomId).emit('joined-to-room', room);
                    console.log('reconect success when find-partner', room);

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
                        try {
                            console.log('have one -> create room');
                            // tạo phòng 
                            _.remove(clients, client => client.userId === userToCreateRoom.userId);
                            // findOrCreateRoomObject by memberIds
                            const roomId = await RoomDetails.findRoomOrCreateOneWithMembers([userToCreateRoom.userId, socket.userId]);

                            const room = {
                                roomId: roomId,
                                userId: userToCreateRoom.userId,
                            };
                            socket.join(room.roomId);

                            userToCreateRoom.socket.join(room.roomId);

                            console.log('prepare joined-to-room', room);

                            io.to(room.roomId).emit('joined-to-room', room);

                            const user = await User.findOne({
                                _id: userToCreateRoom.userId
                            });

                            user.trading = user.trading + 1;
                            user.save();
                            console.log('trading1>>', user.trading);

                            const user2 = await User.findOne({
                                _id: socket.userId
                            });
                            user2.trading = user2.trading + 1;
                            user2.save();
                            console.log('trading2>>', user2.trading);

                            console.log('joined-to-room successfully');
                            const messageCreatedResult = await MessageModel.sendMessageToRoom(userToCreateRoom.userId, socket.userId, 'system', 'The conversation begins.\nSay \'bye\' to end conversation', room.roomId);
                            io.to(room.roomId).emit('new-message', messageCreatedResult);
                        } catch (e) {
                            socket.emit('error', {
                                data: socket.userId,
                                msg: 'find-partner failed',
                                type: 'find-partner'
                            });
                            console.log(e);
                        }

                    }
                }

            });
            socket.on('send-message', async(message) => {
                
                const r = await RoomDetails.findRoomActive(socket.userId);
                if (r) {
                    // send message to room
                    const trading = r.members.find(element => element != socket.userId);
                    // check word
                    const user = await User.findById({
                        _id: socket.userId
                    })
                    console.log(user);
                    let report = user.report;

                    for (let word of words) {
                        if (message.content.includes(word)) {
                            report++;
                            break;
                        }
                    }

                    handleBlock(report, socket.id, socket.userId, r._id);
                    const messageCreatedResult = await MessageModel.sendMessageToRoom(trading, socket.userId, 'message', message.content, r._id);

                    
                    io.to(messageCreatedResult.room_id).emit('new-message', messageCreatedResult);
                    
                    //console.log('messageCreatedResult > ', messageCreatedResult);
                    //-------------------------------------------------------------------------------------------
                    console.log('============socket.token_device > ', socket.token_device);
                    console.log('============socket.token_device Me> ', token_device);

                } else {
                    socket.emit('error', {
                        data: socket.userId,
                        msg: 'send message failed, not found room active',
                        type: 'send-message'
                    });
                }

            });
            async function handleBlock(report, socketId, userId, roomId) {

                if (report == 3) {
                    socket.to(socketId).emit("warning", "you had use 3 times forbidden words");
                    await User.findByIdAndUpdate({
                        _id: userId
                    }, {
                        report
                    });
                }
                if (report == 5) {
                    socket.to(socketId).emit("warning", "you had use 3 times forbidden words, if 7 times you will block chat");
                    await User.findByIdAndUpdate({
                        _id: userId
                    }, {
                        report
                    });
                }
                if (report == 7) {
                    // cam dung 1h
                    let time = new Date();
                    await User.findByIdAndUpdate({
                        _id: userId
                    }, {
                        report: 0,
                        timeBlock: time.addHours(1)
                    });

                    socket.to(socketId).emit("ban-user", "you had blocked 1h");
                    const r = await RoomDetails.findOne({
                        roomId
                    });
                    let rom = await RoomDetails.findRoomActive(socket.userId);
                    if (rom != null) {
                        rom.status = 1;
                        rom.save();
                        io.to(roomId).emit('partner-left', {
                            roomId
                        });
                        socket.leave(roomId);
                        console.log(roomId);
                    }

                } else {
                    await User.findByIdAndUpdate({
                        _id: userId
                    }, {
                        report
                    });
                }
            }
            socket.on('send-heart', async(data) => {

                const r = await RoomDetails.findRoomActive(socket.userId);
                if (r) {
                    const trading = r.members.find(element => element != socket.userId);
                    const heart = {
                        roomId: r._id,
                        userId: trading,
                    };
                    const messages = await MessageModel.findHeartFromRoomId(heart.roomId, socket.userId);
                    if (!messages) {
                        const user = await User.findOne({
                            _id: heart.userId
                        });
                        user.heart = user.heart + 1;
                        user.save();

                        const messageCreatedResult = await MessageModel.sendMessageToRoom(trading, socket.userId, 'send-heart', 'You have send a heart', heart.roomId);
                        io.to(heart.roomId).emit('new-message', messageCreatedResult);
                        console.log('received-heart:>>', messageCreatedResult);
                    }

                } else {
                    socket.emit('error', {
                        data: socket.userId,
                        msg: 'send heart failed, not found room active',
                        type: 'send-heart'
                    });
                }
            });
            socket.on('send-report', async(data) => {

                console.log('reason Reported', data.reason);

                const r = await RoomDetails.findRoomActive(socket.userId);
                if (r) {
                    const trading = r.members.find(element => element != socket.userId);
                    const report = {
                        roomId: r._id,
                        userId: trading,
                    };

                    const user = await User.findOne({
                        _id: report.userId
                    });
                    user.report = user.report + 1;
                    user.save();

                    const messageCreatedResult = await MessageModel.sendMessageToRoom(trading, socket.userId, 'send-report', 'You have report stranger', report.roomId);
                    io.to(report.roomId).emit('new-message', messageCreatedResult);

                    console.log('received-report:>>', user.report);
                } else {
                    socket.emit('error', {
                        data: socket.userId,
                        msg: 'send report failed, not found room active',
                        type: 'send-report'
                    });
                }
            });

            socket.on('leave-room', async(roomId) => {

                console.log('leave-room waiting');
                const r = await RoomDetails.findRoomActive(socket.userId);
                if (!r) {
                    console.log('leave done waiting : roomId not found');
                    socket.emit('error', {
                        data: socket.userId,
                        msg: 'leave room failed, not found room active',
                        type: 'leave-room'
                    });
                } else {

                    console.log(r);
                    // 0 : active
                    r.status = 1; // 1 : one left
                    r.save();
                    const room = {
                        roomId: r._id,
                        userId: socket.userId,
                    };
                    io.to(room.roomId).emit('partner-left', room);

                    socket.leave(room.roomId);

                    const trading = r.members.find(element => element != socket.userId);
                    const messageCreatedResult = await MessageModel.sendMessageToRoom(trading, socket.userId, 'system', 'The conversation ended', room.roomId);
                    io.to(messageCreatedResult.room_id).emit('new-message', messageCreatedResult);
                    console.log('leave done', r);
                }
            });

            socket.on('reconnection', async(userId) => {
                console.log('reconnect waiting ');

                const r = await RoomDetails.findRoomActive(socket.userId);
                console.log('reconnect room: ', r);

                if (r) {
                    const trading = r.members.find(element => element != socket.userId);
                    const room = {
                        roomId: r._id,
                        userId: trading,
                    };

                    socket.join(room.roomId);
                    console.log('reconnect success ', room);

                    io.to(room.roomId).emit('joined-to-room', room);
                } // connected done
                else {
                    socket.emit('room-closed', userId);
                }
            });
            socket.on("disconnect", reason => {
                _.remove(clients, client => client.userId === socket.userId);
                console.log("disconnected", socket.username, socket.userId, socket.disconnected, reason);
            });
        }


    });
};
module.exports = connect;