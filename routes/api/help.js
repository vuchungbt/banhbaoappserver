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

// create a help
router.post("/", auMiddleware, async(req, res) => {
    let {
        title,
        description,
        link
    } = req.body
    if (!title || !description) {
        return res.status(400).json({
            status: 400,
            msg: "Please enter both title and description!"
        });
    }
    try {
        let newHelp = await Help.create({
            title,
            description,
            link
        });
        res.status(200).json({
            status: 200,
            newHelp
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: 400,
            msg: "Create help failed!"
        });
    }
})

// update a help by _ID

router.put("/:_id", auMiddleware, async(req, res) => {
    const _id = req.params._id;
    try {
        if (mongoose.Types.ObjectId.isValid(_id)) {
            await Help.findByIdAndUpdate({
                _id
            }, req.body);
            res.status(200).json({
                status: 200,
            });
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

// delete a help
router.delete("/:_id", auMiddleware, async(req, res) => {
    const _id = req.params._id;
    try {
        if (mongoose.Types.ObjectId.isValid(_id)) {
            await Help.findByIdAndDelete({
                _id
            });
            res.status(200).json({
                status: 200,
            })
        } else {
            res.status(404).json({
                status: 404,
                msg: "Not Found!"
            });
        }

    } catch (error) {
        console.log(error);
    }
});

module.exports = router;