const express = require("express");
const { getMessagesByRoomId } = require("../../controllers/message.controller");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

router.get('/rooms/:roomId', authMiddleware, getMessagesByRoomId);

module.exports = router;