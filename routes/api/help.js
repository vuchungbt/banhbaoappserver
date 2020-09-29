const Help = require("../../models/Help");
const express = require("express")
const router = express.Router();
const auMiddleware = require("../../middleware/auth");
const mongoose = require("mongoose");
// get all helps
router.get("/getAll", async(req, res) => {
    try {
        const helps = await Help.find();
        res.status(200).json({
            status: 200,
            helps
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: 400,
            msg: "Get all helps failed"
        });
    }
});


// get a help by _id
router.get("/:_id", async(req, res) => {
    const _id = req.params._id;
    try {
        if (mongoose.Types.ObjectId.isValid(_id)) {
            const help = await Help.findById({
                _id
            });
            res.status(200).json({
                status: 200,
                help
            })
        } else {
            res.status(404).json({
                status: 404,
                msg: "Not Found"
            });
        }

    } catch (error) {
        console.log(error);
    }
});

module.exports = router;