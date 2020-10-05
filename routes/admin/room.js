const Room = require('../../models/Database');
const express = require('express');
const router = express.Router();
const Messages = require('../../models/Message');

router.get('/:page', async(req, res) => {
    let perPage = 15;
    let page = parseInt(req.params.page) || 1;

    const rooms = await Room.find()
        .skip(perPage * page - perPage)
        .limit(perPage);
    let count = await Room.countDocuments();
    let pages = [];
    for (let i = 0; i < Math.ceil(count / perPage); i++) {
        pages[i] = i + 1;
    }
    let prevPage, nextPage;
    prevPage = page - 1;
    nextPage = page + 1;
    page - 1 <= 0 ? (prevPage = page) : (prevPage = page - 1);
    page + 1 > pages.length ? (nextPage = page) : (nextPage = page + 1);

    console.log(prevPage, page, nextPage);
    console.log(pages);
    res.render('room/showroom.pug', {
        rooms,
        currentPage: page,
        prevPage,
        nextPage,
        pages: pages,
    });
});

router.get('/getmessages/:_id', async(req, res) => {
    const room_id = req.params._id;
    var messages = await Messages.find({
        room_id,
    }, {
        content: 1,
        sender: 1,
        created_at: 1

    }, );
    const room = await Room.findById({
        _id: room_id,
    });
    let mess = [];
    let a;
    for (let item of messages) {
        if (JSON.stringify(room.members[0]) == JSON.stringify(item.sender)) {
            a = {
                _id: item._id,
                sender: item.sender,
                content: item.content,
                created_at: item.created_at,
                check: 1,
            };
        } else {
            a = {
                _id: item._id,
                sender: item.sender,
                content: item.content,
                created_at: item.created_at,

            };
        }
        mess.push(a);
    }
    res.render('room/room.pug', {
        mess,
        room,
    });
});
module.exports = router;