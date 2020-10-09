const User = require('../models/User');
const nameRegex = /^[A-Za-z0-9]{3,22}$/;
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const passRegex = /^[A-Za-z0-9/:@!#$^&_+*\(\)\[-`{-~]{6,24}/;

module.exports.valiEmailUser = async(req, res, next) => {
    let { username, email, password, dob } = req.body;

    if (!nameRegex.test(username)) {
        return res.status(400).json({
            status: 400,
            msg: 'Username is not in the correct format, minimum length of 3, up to 22 ',
        });
    }
    if (!emailRegexp.test(email)) {
        return res.status(400).json({
            status: 400,
            msg: 'Email is not in the correct format, minimum length of 3, up to 22',
        });
    }
    username = username.toLowerCase();

    const user = await User.find({
        $or: [{
                username,
            },
            {
                email,
            },
        ],
    });

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
    if (!passRegex.test(password)) {
        return res.status(400).json({
            status: 400,
            msg: 'Password must contain no spaces and have a minimum length of 6, up to 24',
        });
    }
    if (!checkDate(dob)) {
        return res.status(400).json({
            status: 400,
            msg: 'Age must be 13+',
        });
    }
    next();
};

function checkDate(dob) {
    let time = new Date();
    let now = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    let dateArr = dob.split('/');
    let dateOfBirth = new Date(dateArr[2], dateArr[0], dateArr[1]);
    let check = (now - dateOfBirth) / (1000 * 60 * 60 * 24 * 365);
    if (check >= 13) return true;
    else return false;
}