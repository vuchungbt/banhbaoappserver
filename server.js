const express = require('express');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const morgan = require('morgan');
const config = require('config');
const mongo = require("./config/mongo");
var cors = require('cors');
const cookieParser = require('cookie-parser');
const connect = require('./routes/api/chat');
const users = require('./routes/api/user');
const auth = require('./routes/api/auth');
const message = require('./routes/api/message');
const bodyParser = require("body-parser")
const authAdmin = require('./routes/admin/auth');
const user = require("./routes/admin/user")
const link = require("./routes/admin/link")


const app = express();
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('view engine', 'pug');
app.set('views', './views');
app.use(morgan('tiny'));
//const server = require("http").Server(app);
//const io = require("socket.io")(server);
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(bodyParser.json());
app.use(cookieParser(config.get("jwtSecret")));
const server = require('http').Server(app);
const io = require('socket.io')(server);
const iohttps = require('socket.io')(https);
server.listen(80, () => console.log('Started on port 3000...'));

// connect(io);
// connect(iohttps);

const port = process.env.PORT || 443;
https
    .createServer({
            key: fs.readFileSync('./ssl/private.key'),
            cert: fs.readFileSync('./ssl/certificate.crt'),
            ca: [fs.readFileSync('./ssl/ca_bundle.crt')],
            //passphrase: 'abcd'
        },
        app,
    )
    .listen(port);

console.log('app is running on port ', port);
connect(io);

app.get('/', function(req, res) {
    res.render('document/home.ejs');
});
app.get('/document/v1.0.0/release', function(req, res) {
    res.render('document/document.ejs');
});
app.get('/document/admin/v1.0.0/release', function(req, res) {
    res.render('document/document-admin.ejs');
});

app.get('/admin', (req, res) => {
    res.render('template.pug');
});
app.use(express.json());
app.use(cors());

//DB config
const dbURI = config.get('mongoURI');

mongo.connect();

app.use('/api/user', users);
app.use('/api/auth', auth);
app.use('/api/messages', message);
app.use('/admin/auth', authAdmin);
app.use("/admin/user", user);
app.use("/admin/link", link)