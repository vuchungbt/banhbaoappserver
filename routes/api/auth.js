const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/auth");

//Model
const User = require("../../models/User");

// @route POST api/auth
// @desc Authenticate An User
// @access Public
router.post("/", (req, res) => {
  console.log("Login body", req.body);
  let { username, password } = req.body;
  //Simple validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ status:"400",msg: "Please enter both username and password!" });
  }

  username = username.toLowerCase();

  //Check for existing user
  User.findOne({ username }).then(user => {
    if (!user) {
      console.log("user not exist");
      return res.status(401).json({status:401, msg: "User does not exists" });
    } else {
      validatePass(res, password, user);
    }
  });
});

function validatePass(res, password, user) {
  //Validate password
  bcrypt.compare(password, user.password).then(isMatch => {
    if (!isMatch) return res.status(401).json({ status:401,msg: "Password is incorect!" });
    jwt.sign(
      { id: user.id,
      username: user.username },
      config.get("jwtSecret"),
      { expiresIn: 10000000 },
      (err, token) => {
        if (err) {
            console.log("failed valid jwt");
            res.status(401)
            .json({
                status:401,
                msg: "failed valid token"
              });
        };
        const responseUser = {
          token,
          _id: user._id,
          username: user.username
        };
        res.status(200)
        .json({
            status:200,
            user: responseUser
        });
        
      }
    );
  });
}

// @route POST api/auth/me
// @desc Get user data
// @access Private
router.get("/me", authMiddleware, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then(User => {
      res.json(
          { 
                status:200,
                User 
            }
          );
    });
});
module.exports = router;
