const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/auth");

const User = require("../../models/User");

// @route POST api/user
// @desc Create An User
// @access Public
router.post("/", (req, res) => {
  console.log("Register body :", req.body);

  let { username, password, firstname, lastname, email, dob, gender } = req.body;

  //Simple validation
  if (!username || !password) {
    return res
      .status(400)
      .json(
        {
          status: 400,
          msg: "Please enter both username and password!"
        }
      );
  }
  username = username.toLowerCase();

  //Check for existing user
  User.findOne({ username }).then(user => {
    if (user) {
      return res.status(400).json({
        status: 400,
        msg: "User already exists"
      });
    }
    const newUser = new User({
      username,
      password,
      firstname, lastname, email, gender
    });
    createUser(res, newUser);
  });

});
function createUser(res, newUser) {
  //Create salt and hash
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log("failed bcrypt");
        res.status(401)
          .json({
            status: 401,
            msg: "bcrypt password failed"
          });
      };
      newUser.password = hash;
      newUser.save().then(user => {
        jwt.sign(
          { id: user.id },
          config.get("jwtSecret"),
          { expiresIn: 86400 },
          (err, token) => {
            if (err) {
              console.log("failed bcrypt");
              res.status(401)
                .json({
                  status: 401,
                  msg: "jwt failed"
                });
            };
            res.status(200)
              .json({
                status: 200,
                user: {
                  token,
                  _id: user.id,
                  username: user.username
                }
              });
          }
        );
      });
    });
  });
}

// @route GET api/user/:couple_id
// @desc Sync User couple Id
// @access Public
router.get("/", authMiddleware, (req, res) => {
  const condition = { _id: req.user.id };
  User.findOne(condition)
    .select("-password")
    .then(user => {
      if (user) {
        res.status(200)
          .json({
            status: 200,
            user: user
          });

      } else {
        res.status(400).json({
          status: 400,
          msg: "Get user infor failed"
        });
      }
    });
});


// @route POST api/user/update
// @desc Create An User
// @access Public
router.post("/update", authMiddleware, (req, res) => {

  var condition = { _id: req.user.id };

  console.log("update request body", req.body);

  updateUser(condition, req.body)
    .then(updatedUser =>
      res.json({
        status: 200,
        user: updatedUser
      })
    )
    .catch(err => res.json({
      status: 400,
      msg: "Update failed"
    }));
});

const updateUser = (condition, updateBody) => {
  return User.findOneAndUpdate(condition, updateBody, { new: true }).select(
    "-password"
  );
};


module.exports = router;