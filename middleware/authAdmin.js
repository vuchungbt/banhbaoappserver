const bcrypt = require('bcryptjs');
const config = require("config");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin")
module.exports.validate = async(req, res, next) => {
    let {
        username,
        password
    } = req.body;
    username = username.toLowerCase();
    const admin = await Admin.findOne({
        username,
    });
    if (!admin) {
        res.render('auth/login.pug');
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
        res.render('auth/login.pug');
    }
    const token = jwt.sign({
        id: admin._id,
        username: admin.username
    }, config.get("jwtSecret"));
    console.log(token);
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1800000,
        signed: true
    });
    next();
}

module.exports.logged = async(req, res, next) => {
    const token = req.signedCookies.token;
    if (!token || token == "null" || token == "" || token == null || token == undefined) {
        console.log("no token");
        return res.redirect("/admin/auth/login");
    }
    try {
        const decodedToken = jwt.verify(token, config.get("jwtSecret"));
        req.admin = decodedToken;
        next();
    } catch (error) {
        console.log("token is invalid");
        res.redirect("/admin/auth/login");
    }
}