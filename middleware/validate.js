const User = require("../models/User");

module.exports.valiEmailUser = async(req, res, next) => {
    let {
        username,
        email
    } = req.body;
    const nameRegex = /^[A-Za-z0-9]{3,22}$/;
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!nameRegex.test(username)) {
        return res.status(400).json({
            status: 400,
            msg: 'Username is not in the correct format',
        });
    }
    if (!emailRegexp.test(email)) {
        return res.status(400).json({
            status: 400,
            msg: 'Email is not in the correct format',
        });
    }
    username = username.toLowerCase();

    const user = await User.find({
        $or: [{
            username
        }, {
            email
        }]
    })

    if (user.length != 0 && user[0].username == username) {
        return res.status(400).json({
            status: 400,
            msg: 'Username already exists',
        });
    }
    if (user.length != 0 && user[0].email == email) {
        return res.status(400).json({
            status: 400,
            msg: 'Email already exists',
        });
    }
    next();
}