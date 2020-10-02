const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;


// hien 
const messageSchema = mongoose.Schema({
    type: String,
    sender: String,
    sendTime: Date,
    roomId: String,
    content: String,
    status: String,
});

const roomSchema = mongoose.Schema({
    roomId: String,
    members: [String],
    imageUrl: String,
    name: String,
    status: Number,
    messages: [Object],
    // create_at: {
    //     type: Date,
    //     default: Date.now,
    // },
});
//

const RoomDetailsSchema = new Schema({
    status: Number,
    create_at: {
        type: Date,
        default: Date.now,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
    }]
});
RoomDetailsSchema.statics.findRoom = async function(members) {
    let Room = await RoomDetails.findOne({
        status: 0
    }).where('members').in(members);
    if (!Room) {
        Room = await RoomDetails.findOne({
            status: 1
        }).where('members').in(members);
    }
    return Room;
}

RoomDetailsSchema.statics.findRoomActive = async function(members) {
    let Room = await RoomDetails.findOne({
        status: 0
    }).where('members').in(members);
    return Room;
}
RoomDetailsSchema.statics.findRoomClosed = async function(members) {
    let Room = await RoomDetails.findOne({
        status: 1
    }).where('members').in(members);
    return Room;
}

RoomDetailsSchema.statics.findRoomOrCreateOneWithMembers = async function(members) {
    let resultRoom = await RoomDetails.findOne({
        status: 0
    }).where('members').in(members);
    if (!resultRoom) {
        resultRoom = await RoomDetails.create({
            status: 0,
            members: members
        });
    }
    return resultRoom._id;
}

module.exports = RoomDetails = mongoose.model("Room", RoomDetailsSchema);

module.exports.MessageRespo = mongoose.model("message", messageSchema);
module.exports.RoomRespo = mongoose.model("room", roomSchema);