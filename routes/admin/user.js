const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authAdmin")
router.get("/", auth.logged, (req, res) => {
    const admin = req.admin;
    res.render("user/user.pug", {
        admin
    })
})

async function countUserActive() {

}
module.exports = router;