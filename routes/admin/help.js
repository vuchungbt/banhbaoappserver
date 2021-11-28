const express = require("express");
const router = express.Router();
const Help = require("../../models/Help");
const auth = require("../../middleware/authAdmin");

router.get("/", auth.logged, async(req, res) => {
    const helps = await Help.find();
    res.render("help/help.pug", {
        helps
    })
});

router.get("/create", auth.logged, async(req, res) => {
    res.render("help/create.pug");
});

router.post("/create", auth.logged, async(req, res) => {
    try {
        await Help.create(req.body);
        res.redirect("/admin/help");
    } catch (error) {
        res.render("help/create.pug", {
            mess: " create fail"
        });
    }
});

router.get("/delete/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    try {
        await Help.findByIdAndRemove({
            _id
        });
        res.redirect("/admin/help");
    } catch (error) {
        res.redirect("/admin/help");
    }
});

router.get("/update/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    const help = await Help.findById({
        _id
    });
    res.render("help/update.pug", {
        help
    });
})

router.post("/update/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    try {
        await Help.findByIdAndUpdate({
            _id
        }, req.body);
        res.redirect("/admin/help");
    } catch (error) {
        res.redirect("/admin/update");
    }
})
module.exports = router;