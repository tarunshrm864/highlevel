
const express = require("express");
const cors = require("cors");
const initializeRouter = require("./module/core/router");



const app = express();
app.use(express.json());
app.use(cors());

initializeRouter(app);


module.exports = app;
