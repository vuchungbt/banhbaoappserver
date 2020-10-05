const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const authMiddleware = require('../../middleware/auth');
const validate = require("../../middleware/validate");
const Link = require('../../models/Link');
const User = require('../../models/User');
const Feedback = require('../../models/Feedback');
const ResetPass = require('../../models/resetPass');
const ALPHABET = '0123456789ABCDEFGHIKLMNOPQRSTUVWXYZ';

// @route POST api/user
// @desc Create An User
// @access Public

router.post('/', validate.valiEmailUser, (req, res) => {

    let {
        username,
        password,
        firstname,
        lastname,
        email,
        dob,
        gender
    } = req.body;



    const newUser = new User({
        username,
        password,
        firstname,
        lastname,
        email,
        gender,
        dob,
    });
    createUser(res, newUser);

});

function createUser(res, newUser) {
    //Create salt and hash
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                console.log('failed bcrypt');
                res.status(401).json({
                    status: 401,
                    msg: 'bcrypt password failed',
                });
            }
            newUser.password = hash;
            newUser.save().then((user) => {
                jwt.sign({
                        id: user.id,
                    },
                    config.get('jwtSecret'), {
                        expiresIn: 8640000,
                    },
                    (err, token) => {
                        if (err) {
                            console.log('failed bcrypt');
                            res.status(401).json({
                                status: 401,
                                msg: 'jwt failed',
                            });
                        }
                        res.status(200).json({
                            status: 200,
                            user: {
                                token,
                                _id: user.id,
                                username: user.username,
                            },
                        });
                    },
                );
            });
        });
    });
}

// @route GET api/user/:couple_id
// @desc Sync User couple Id
// @access Public
router.get('/', authMiddleware, (req, res) => {
    const condition = {
        _id: req.user.id,
    };
    User.findOne(condition)
        .select('-password')
        .then((user) => {
            if (user) {
                res.status(200).json({
                    status: 200,
                    user: user,
                });
            } else {
                res.status(400).json({
                    status: 400,
                    msg: 'Get user infor failed',
                });
            }
        });
});

// @route POST api/user/update
// @desc Create An User
// @access Public
router.post('/update', authMiddleware, (req, res) => {
    var condition = {
        _id: req.user.id,
    };

    console.log('update request body', req.body);

    updateUser(condition, req.body)
        .then((updatedUser) =>
            res.json({
                status: 200,
                user: updatedUser,
            }),
        )
        .catch((err) =>
            res.json({
                status: 400,
                msg: 'Update failed',
            }),
        );
});

const updateUser = (condition, updateBody) => {
    return User.findOneAndUpdate(condition, updateBody, {
        new: true,
    }).select('-password');
};

// @route POST api/user/password
// @desc Change password
// @access Public
router.post('/password', authMiddleware, (req, res) => {
    var _id = req.user.id;
    let {
        password,
        new_password
    } = req.body;

    if (!password || !new_password) {
        return res.status(400).json({
            status: '400',
            msg: 'Please enter both password!',
        });
    }

    User.findById({
        _id
    }).then((user) => {
        if (!user) {
            console.log('user not exist');
            return res.status(401).json({
                status: 401,
                msg: 'User does not exists',
            });
        } else {
            validatePass(res, _id, password, user, new_password);
        }
    });
});

function validatePass(res, _id, password, user, new_password) {
    //Validate password
    bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch)
            return res.status(401).json({
                status: 401,
                msg: 'Password is incorect!',
            });
        updatePass(res, _id, new_password);
    });
}

function updatePass(res, _id, new_password) {
    //Create salt and hash
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(new_password, salt, (err, hash) => {
            if (err) {
                console.log('failed bcrypt');
                res.status(401).json({
                    status: 401,
                    msg: 'bcrypt password failed',
                });
            }
            new_password = hash;
            User.update({
                    _id,
                }, {
                    password: new_password,
                },
                function(err, affected, resp) {
                    res.json({
                        status: 200,
                        msg: 'Update success',
                    });
                },
            );
        });
    });
}

// @route POST api/user/feedback
// @desc send feedback
// @access Public
router.post('/feedback', authMiddleware, (req, res) => {
    var user_id = req.user.id;
    let {
        title,
        feedback
    } = req.body;
    if (!feedback) {
        return res.status(400).json({
            status: 400,
            msg: 'Please enter both feedback!',
        });
    }
    var time = new Date();
    console.log(time);
    console.log(user_id);
    const newFeedback = new Feedback({
        user_id,
        title,
        feedback,
        time,
    });
    newFeedback.save().then((feedback) => {
        if (feedback) {
            res.status(200).json({
                status: 200,
                msg: 'Feedback success',
            });
        } else {
            res.status(400).json({
                status: 400,
                msg: 'Feedback failed',
            });
        }
    });
});
// @route POST api/user/getlinkconfessionorgroupfb
// @desc get link confession or group
// @access Public
router.get('/getlinkconfessionorgroupfb', authMiddleware, async(req, res) => {
    try {
        const links = await Link.find({
            $or: [{
                    name: {
                        $eq: 'group',
                    },
                },
                {
                    name: {
                        $eq: 'confession',
                    },
                },
            ],
        });
        console.log(links);
        if (links.length != 0) {
            res.status(200).json({
                status: 200,
                links,
            });
        } else {
            res.status(404).json({
                status: 404,
                msg: 'Not Found',
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: 400,
            msg: 'Link group and confession failed',
        });
    }
});
//random code

function generate() {
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return id;
}

// @route POST api/user/resetPassword/:userId
// @desc send code to email user
// @access Public
router.post('/resetpassword', async(req, res) => {
    const email = req.body.email;
    const resetPass = await ResetPass.find({
        email,
    });
    const user = await User.findOne({
        email,
    });
    _id = user._id;
    const mailUser = email;
    const code = generate();
    if (resetPass.length != 0) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(code, salt, async(err, hash) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({
                        status: 401,
                        msg: 'bcrypt code failed',
                    });
                }
                await ResetPass.findOneAndUpdate({
                    email,
                }, {
                    enCode: hash,
                }, );
            });
        });
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(code, salt, async(err, hash) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({
                        status: 401,
                        msg: 'bcrypt code failed',
                    });
                }
                await ResetPass.create({
                    email: mailUser,
                    userId: _id,
                    enCode: hash,
                });
            });
        });
    }
    try {
        sendmail(mailUser, code);
        res.status(200).json({
            status: 200,
            mess: 'We sent code to your email',
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({
            status: 401,
            mess: 'Sent code fail',
        });
    }
});

async function sendmail(mailUser, code) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: config.get('gmail'),
            pass: config.get('pass'),
        },
    });
    await transporter.sendMail({
        from: config.get('gmail'),
        to: mailUser,
        subject: config.get("subject"),
        text: config.get("text") + code
    });
}

router.post('/confirm', async(req, res) => {
    const {
        code,
        email
    } = req.body;
    const resetCode = await ResetPass.findOne({
        email,
    });
    const user = await User.findOne({
        email,
    });
    const userId = user._id;

    if (!resetCode) {
        res.status(404).json({
            status: 404,
            mess: 'Code not found',
        });
    }
    enCode = resetCode.enCode;
    const match = await bcrypt.compare(code, enCode);
    if (!match) {
        res.status(400).json({
            status: 400,
            mess: 'Code Fail',
        });
    }
    console.log(match);
    res.status(200).json({
        status: 200,
        mess: 'Confirm code',
        // userId: userId
    });
});

router.post('/changepassword', async(req, res) => {
    const {
        email,
        code,
        password
    } = req.body;
    const resetCode = await ResetPass.findOne({
        email,
    });
    enCode = resetCode.enCode;
    const match = await bcrypt.compare(code, enCode);
    if (!match) {
        res.status(404).json({
            status: 404,
            mess: 'Code or email not found',
        });
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async(err, hash) => {
            if (err) {
                console.log(err);
                res.status(401).json({
                    status: 401,
                    msg: 'bcrypt code failed',
                });
            }
            try {
                await User.findOneAndUpdate({
                    email,
                }, {
                    password: hash,
                }, );
                await ResetPass.findOneAndRemove({
                    email,
                });
                res.status(200).json({
                    status: 200,
                    msg: 'Changed password',
                });
            } catch (error) {
                console.log(error);
                res.status(404).json({
                    status: 404,
                    msg: 'Code or email not found',
                });
            }
        });
    });
});

module.exports = router;