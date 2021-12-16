const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const config = require('config');
const mongo = require('./config/mongo');
var cors = require('cors');
const cookieParser = require('cookie-parser');
const connect = require('./routes/api/chat');
const users = require('./routes/api/user');
const auth = require('./routes/api/auth');
const message = require('./routes/api/message');
const bodyParser = require('body-parser');
const authAdmin = require('./routes/admin/auth');
const authloged = require("./middleware/authAdmin");
const user = require('./routes/admin/user');
const link = require('./routes/admin/link');
const feedback = require('./routes/admin/feedback');
const help = require("./routes/admin/help");
const room = require("./routes/admin/room");
const app = express();
// app.use(cookieParser());
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'js')));
app.set('view engine', 'ejs');
app.set('view engine', 'pug');
app.set('views', './views');
//app.use(morgan('tiny'));
const server = require("http").Server(app);
//const io = require("socket.io")(server);
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(bodyParser.json());
app.use(cookieParser(config.get('jwtSecret')));

const io = require('socket.io')(server);

const port = process.env.PORT || 3016;
server.listen(port, () => console.log(`Started on port ${port}...`));

//const port = process.env.PORT || 443;
//console.log('app is running on port ', port);

connect(io);
app.get('/admin', authloged.logged, (req, res) => {
    res.render('template.pug');
});

app.get('/', function(req, res) {
    // res.render('document/home.ejs');
    res.render("landing.pug");
});
app.get('/document/v1.0.0/release', function(req, res) {
    res.render('document/document.ejs');
});
app.get('/document/v1.0.1/release', function(req, res) {
    res.render('document/document1.0.1.ejs');
});
app.get('/document/admin/v1.0.0/release', function(req, res) {
    res.render('document/document-admin.ejs');
});
app.get('/remove', function(req, res) {
    res.render('document/remove_user.ejs');
});
app.use(express.json());
app.use(cors());

mongo.connect();
app.use('/api/user', users);
app.use('/api/auth', auth);
app.use('/api/messages', message);
app.use('/admin/auth', authAdmin);
app.use('/admin/user', user);
app.use('/admin/link', link);
app.use('/admin/feedback', feedback);
app.use("/admin/help", help);
app.use("/admin/room", room);
