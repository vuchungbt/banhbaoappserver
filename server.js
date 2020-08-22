const express = require("express");
const mongoose = require("mongoose");

const config = require("config");
var cors = require("cors");

const connect = require("./routes/api/chat");
const users = require("./routes/api/user");
const auth = require("./routes/api/auth");

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views","./views");

const server = require("http").Server(app);
const io = require("socket.io")(server);
server.listen(3000, () => console.log("Started on port 3000..."));

connect(io);

app.get("/", function(req,res){
    res.render("home");
});
app.get("/document/v1.0.0/release", function(req,res){
  res.render("document");
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
const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`App started on port ${port}`));