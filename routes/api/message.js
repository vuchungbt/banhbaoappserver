const express = require("express");
const { getMessages } = require("../../controllers/message.controller");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

router.get('/:userId/:page', authMiddleware, getMessages);

module.exports = router;