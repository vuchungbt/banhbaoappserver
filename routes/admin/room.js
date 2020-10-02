const Room = require("../../models/Database");
const express = require("express");
const router = express.Router();

router.get("/:page", async(req, res) => {
    let perPage = 15;
    let page = req.params.page || 1;

    const rooms = await Room.find().skip(perPage * page - perPage).limit(perPage);
    let count = await Room.countDocuments();
    let pages = [];
    for (let i = 0; i < Math.ceil(count / perPage); i++) {
        pages[i] = i + 1;
    }
    console.log(pages);
    res.render("room/showroom.pug", {
        rooms,
        currentPage: page,
        pages: pages
    })
})

module.exports = router;