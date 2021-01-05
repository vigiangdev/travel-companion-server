const mongoose = require('mongoose');
require('dotenv').config();

const db = process.env.DB_HOST.replace("<password>", process.env.DB_PASSWORD).replace("<dbname>", process.env.DB_NAME);
const port = process.env.PORT || 3000;

const app = require("./app");

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
          });
          console.log("Connected to database.")
    } catch (err) {
        console.log(err);
    }
}

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("Disconnected from database.")
    } catch (err) {
        console.log(err);
    }
}

const closeServer = async (server) => {
    try {
        await server.close(async () => {
            await disconnectDB();
        })
    } catch (err) {
        console.log(err);
    }
}

connectDB();

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});

process.on('SIGTERM', async signal => {
    console.log(`Process ${process.pid} received a SIGTERM signal`);
    await closeServer(server);
    process.exit(0);
});

process.on('SIGINT', async signal => {
    console.log(`Process ${process.pid} has been interrupted`);
    await closeServer(server);
    process.exit(0);
});

process.on('uncaughtException', async err => {
    console.log(`Uncaught Exception: ${err.message}`);
    await closeServer(server);
    process.exit(1);
});

process.on('unhandledRejection', async (err, promise) => {
    console.log('Unhandled rejection at ', promise, `reason: ${err.message}`);
    await closeServer(server);
    process.exit(1);
});