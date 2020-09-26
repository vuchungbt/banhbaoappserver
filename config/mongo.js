const mongoose = require("mongoose");
const config = require('config');
// config connect mongodb
exports.connect = async() => {
    try {
        await mongoose.connect(config.get("mongoURI"), {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            dbName: 'banhbaoapp',
        });
        console.log("db connection");
    } catch (error) {
        console.log(error);
    }
    return mongoose.connection;
};