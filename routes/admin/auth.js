const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const Admin = require('../../models/Admin');
const middlewareAdmin = require('../../middleware/authAdmin');
router.post('/register', async(req, res) => {
    let {
        username,
        password
    } = req.body;
    username = username.toLowerCase();
    const admin = await Admin.findOne({
        username,
    });
    console.log(admin);
    if (admin) {
        return res.status(400).json({
            status: 400,
            msg: 'Admin already exists',
        });
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async(err, hash) => {
            if (err) {
                res.status(401).json({
                    status: 401,
                    msg: 'bcrypt password failed',
                });
            }
            password = hash;
            await Admin.create({
                username,
                password,
            });
            res.status(200).json({
                username,
            });
        });
    });
});

router.get('/login', (req, res) => {
    res.render('auth/login.pug');
});

router.post('/login', middlewareAdmin.validate, async(req, res) => {
    res.redirect('/admin');
});

module.exports = router;