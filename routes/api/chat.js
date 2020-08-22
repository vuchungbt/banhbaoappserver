const config = require("config");
const jwt = require("jsonwebtoken");
const _ = require("lodash");


const RoomDetails = require("../../models/Database");
const User = require("../../models/User");
const ALPHABET = "0123456789ABCDEFGHIKLMNOPQRSTUVWXYZ";

const decodedToken = token => jwt.verify(token, config.get("jwtSecret"));


var clients = [];
const rooms = [];

const connect = io => {
    io.on("connection", function(socket) {

        const token = socket.handshake.query.token;
        if(!token || token == "null" || token == "" || token == null || token == undefined ) {
            console.log("token invalid:",token);
        }
        else {
            const username = decodedToken(token).username;  
            console.log("username", username);
            console.log("connected", socket.connected);

            // socket.on("send-message", (message) => {
            //     User.findOne(condition)
            //     .select("-password")
            //     .then(user => {
            //         if (user) {
            //             const roomActi = {userID:userID,status:1}
            //             RoomDetails.findOne(roomActi)
            //             .then(room => {
            //                 if(room){
            //                     // success
            //                     console.log("connected", message);
            //                     socket.emit("all-message",user.username +":"+ message);
            //                 }
            //                 else {
            //                     console.log("not found room");
            //                 }
            //             });
                
            //         } else {
            //             // failed
            //             socket.emit("error","User not exist");
            //         }
            //     });
            // });



            socket.on("find-partner", (data) => { 
                
                console.log('start matching for ' + username + ' ...');
                
                // lấy ngẫu nhiên trong hàng đợi 1 user để tạo room

                const userToCreateRoom = _.sample(clients);

                if(!userToCreateRoom) // ko co ai
                {
                    console.log('no body');
                    
                    clients.push({
                        socket : socket,
                        username: username
                    });
                }
                else { // create room 

                    console.log('found ', userToCreateRoom.socket.id);
                    // tạo phòng 
                    _.remove(clients, x => x.username === userToCreateRoom.username);
                    const newRoomId = _.uniqueId('room-');

                    rooms.push({
                        roomId: newRoomId
                        //members: [username, userToCreateRoom]
                    });

                    socket.join(newRoomId);
                    userToCreateRoom.socket.join(newRoomId);
                    io.to(newRoomId).emit('joined-to-room', {
                        roomId: newRoomId
                    });
                }
                
                socket.on('send-message', message => {
                    console.log('new message from ',username, message );
                    io.to(message.roomId).emit('new-message', message);

                });

            });
        }

        socket.on("disconnect", reason => {

            console.log("disconnected", socket.disconnected, reason);
            
        });
     });
};
module.exports = connect;