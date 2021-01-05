const express = require("express");

const userRouter = require("./routes/userRouter");

const app = express();

app.use(express.json()); // parses json data (request.ContentType = application/json)
app.use(express.urlencoded({ extended: true })); // parses urlencoded data (request.ContentType = application/x-www-form-urlencoded)

app.use("/api/v1/users", userRouter);

module.exports = app;