const express = require("express");
const router = express.Router();
const Link = require("../../models/Link");
const authMiddleware = require("../../middleware/auth");

// @route GET api/util
// @desc GET An Link Group
// @access Public
router.get("/link", (req, res) => {
    const condition = { name: req.name };
    Link.findOne(condition)
        .then(link => {
            if (link) {
                res.status(200)
                .json({
                    status:200,
                    link: link
                });
              
            } else {
              res.status(400).json({
                  status:400,
                   msg: "Get link infor failed"
                 });
            }
          });
});

// @route POST api/util/link
// @desc Create An Link Group
// @access Public
router.post("/link", authMiddleware, (req, res) => {
    console.log("Register body :", req.body);

    let { name, link, description} = req.body;

    if (!name || !link) {
        return res.status(400).json({
            status: 400,
            msg: "Please enter both name and link!"
        })
    }

    //Check for existing user
    Link.findOne(name)
        .then(link => {
            if (link) {
                return res.status(400).json({
                    status:400,
                    msg: "Link already exists"
                    });
            } else {
                const newLink = new Link({
                    name,
                    link,
                    description
                    });
                createLink(res, newLink);
            }
          });
});

function createLink(res, newLink) {
    newLink.save().then(link => {
        res.status(200)
              .json({
                status:200,
                user: {
                    _id: id,
                    name,
                    link: link,
                    description
                }
              });
    })
}

// @route POST api/util/update
// @desc Create An User
// @access Public
router.post("/update", authMiddleware, (req, res) => {

    var condition = { name: req.name };
    
    console.log("update request body", req.body);

    updateLink(condition, req.body)
      .then(updatedLink =>
        res.json({
            status:200,
            link: updatedLink
        })
      )
      .catch(err => res.json({ 
        status:400,  
        msg: "Update failed" }));
  });

  const updateLink = (condition, updateBody) => {
    return Link.findOneAndUpdate(condition, updateBody, { new: true }).select(
      "-password"
    );
  };