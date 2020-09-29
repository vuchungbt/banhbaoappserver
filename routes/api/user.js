const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');
const Link = require('../../models/Link');
const User = require('../../models/User');
const Feedback = require('../../models/Feedback');

// @route POST api/user
// @desc Create An User
// @access Public
router.post('/', (req, res) => {
    console.log('Register body :', req.body);

    let {
        username,
        password,
        firstname,
        lastname,
        email,
        dob,
        gender
    } = req.body;

    //Simple validation
    if (!username || !password) {
        return res.status(400).json({
            status: 400,
            msg: 'Please enter both username and password!',
        });
    }
    username = username.toLowerCase();

    //Check for existing user
    User.findOne({
        username,
    }).then((user) => {
        if (user) {
            return res.status(400).json({
                status: 400,
                msg: 'User already exists',
            });
        }
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

    User.findById(_id).then((user) => {
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
router.post('/getlinkconfessionorgroupfb', async(req, res) => {
    const {
        name
    } = req.body;

    if (name == 'group' || name == 'confession') {
        getLinkGrouporConfession(name);
    } else {
        res.status(400).json({
            status: 400,
            msg: "the name of the link is not 'group' or 'confession' ",
        });
    }

    async function getLinkGrouporConfession(name) {
        try {
            const link = await Link.findOne({
                name,
            });
            if (link) {
                return res.status(200).json({
                    status: 200,
                    link,
                });
            } else {
                return res.status(404).json({
                    status: 404,
                    msg: `Link ${name} not found`,
                });
            }
        } catch (error) {
            console.log(err);
        }
    }
});

module.exports = router;