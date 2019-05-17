var Server = require("./app/server");
// Le test
Server.start({
    port: 1337,
    mongoCS: "mongodb://localhost/express-mongodb-rabbitmq"
});
