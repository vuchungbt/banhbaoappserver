const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authAdmin")
const User = require("../../models/User");
const mongoose = require("mongoose");
Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
};

router.get("/", auth.logged, (req, res) => {
    res.render("user/user.pug")
})

router.post("/", auth.logged, async(req, res) => {
    const _id = req.body.id;
    try {
        const user = await User.findById({
            _id
        });
        if (user) {
            res.render("user/profile", {
                user
            })
        }
        res.render("user/user.pug", {
            mess: "ID user not found"
        })
    } catch (error) {
        res.render("user/user.pug", {
            mess: "ID user not found"
        })
    }
})

router.get("/delete/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    try {
        await User.findByIdAndRemove({
            _id
        });
        res.render("user/user.pug");
    } catch (error) {
        console.log(error);
        const user = await User.findById({
            _id
        });
        res.render("user/profile", {
            user
        });
    }
})

router.get("/block/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    let time = new Date();
    time = time.addHours(1);
    try {
        await User.findByIdAndUpdate({
            _id
        }, {
            timeBlock: time
        })
    } catch (error) {
        console.log(error);

    }
    const user = await User.findById({
        _id
    });
    res.render("user/profile.pug", {
        user
    });
})
module.exports = router;