const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authAdmin")
const User = require("../../models/User");
const mongo = require("mongoose");
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
        var user = null;
        if (mongo.isValidObjectId(_id)) {
            const userByID = await User.find({
                _id
            }, {
                password: 0
            });
            user = userByID[0];
        } else {
            const userbynName = await User.find({
                username: _id
            }, {
                password: 0
            });
            user = userbynName[0] || null;
        }
        if (user != null) {
            res.render("user/profile", {
                user: user
            })
        }
        res.render("user/user.pug", {
            mess: "ID user or username not found"
        })
    } catch (error) {
        console.log(error);
        res.render("user/user.pug", {
            mess: "ID user or username not found"
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

router.get("/unblock/:_id", async(req, res) => {
    const _id = req.params._id;
    console.log(_id);
    try {
        await User.findByIdAndUpdate({
            _id
        }, {
            timeBlock: new Date()
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