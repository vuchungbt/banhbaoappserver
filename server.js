const express = require("express");
const mongoose = require("mongoose");
const https = require('https');
const fs = require('fs');

const config = require("config");
var cors = require("cors");

const connect = require("./routes/api/chat");
const users = require("./routes/api/user");
const auth = require("./routes/api/auth");
const message = require("./routes/api/message");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

//const server = require("http").Server(app);
//const io = require("socket.io")(server);

const server = require("http").Server(app);
const io = require("socket.io")(server);
const iohttps = require("socket.io")(https);
server.listen(80, () => console.log("Started on port 3000..."));

// connect(io);
// connect(iohttps);

const port = process.env.PORT || 443;
https.createServer({
  key: fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/certificate.crt'),
  ca: [
    fs.readFileSync('./ssl/ca_bundle.crt')
  ]
  //passphrase: 'abcd'
}, app)
  .listen(port);
  
console.log("app is running on port ", port);
connect(io);

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/document/v1.0.0/release", function (req, res) {
  res.render("document");
});
app.get("/document/admin/v1.0.0/release", function (req, res) {
  res.render("document-admin");
});

app.use(express.json());
app.use(cors());


//DB config
const dbURI = config.get("mongoURI");

//Connect to MongoDb
mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDb is connected..."), {
    useNewUrlParser: true,
    dbName: "banhbaoappQA"
  })
  .catch(err => console.log(err));

app.use("/api/user", users);
app.use("/api/auth", auth);
app.use("/api/messages", message);

