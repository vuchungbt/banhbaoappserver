const express = require("express");
const router = express.Router();
const Link = require("../../models/Link");
const auth = require("../../middleware/authAdmin")
router.get("/", auth.logged, auth.logged, async(req, res) => {
    const links = await Link.find();
    res.render("link/link.pug", {
        links
    })
})

router.get("/create", auth.logged, async(req, res) => {
    res.render("link/create.pug");
})

router.post("/create", auth.logged, async(req, res) => {
    const {
        name,
        link,
        description
    } = req.body;
    try {
        const l = await Link.findOne({
            name
        })
        if (l) {
            res.render("link/create.pug", {
                mess: "Tên link đã tồn tại"
            })
        } else {
            await Link.create({
                name,
                link,
                description
            });
            res.redirect("/admin/link");
        }
    } catch (error) {
        res.render("link/create.pug");
    }
})

router.get("/delete/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    try {
        await Link.findByIdAndRemove({
            _id
        });
        res.redirect("/admin/link");
    } catch (error) {
        res.redirect("/admin/link");
    }
})

router.get("/update/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    try {
        const link = await Link.findById({
            _id
        });
        res.render("link/update.pug", {
            link
        });
    } catch (error) {
        res.redirect("/admin/link");

    }
})

router.post("/update/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    const {
        link,
        name,
        description
    } = req.body;
    const l = await Link.find({
        name,
        _id: {
            $ne: _id
        }
    });
    const linkcurrent = await Link.findOne({
        _id
    });
    if (l.length != 0) {
        res.render("link/update.pug", {
            mess: "Tên link đã tồn tại",
            link: linkcurrent
        })
    } else {
        await Link.findByIdAndUpdate({
            _id
        }, {
            name,
            link,
            description
        });
        res.redirect("/admin/link");
    }
})
module.exports = router;