var Server = require("./app/server");

Server.start({
    port: 1337,
    mongoCS: "mongodb://localhost/express-mongodb-rabbitmq"
});