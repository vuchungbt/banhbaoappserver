const Feedback = require("../../models/Feedback");
const express = require("express");
const auth = require("../../middleware/authAdmin");
const router = express.Router();

router.get("/", async(req, res) => {
    let feedbacks = await Feedback.find();
    feedbacks.reverse();
    res.render("feedback/feedback.pug", {
        feedbacks
    })
})
router.post("/", auth.logged, async(req, res) => {
    await Feedback.create(req.body);
    res.status(200).json(req.body);
})
module.exports = router;