const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import

const userRouter = require("./routes/user.routes.js");
const ownerRouter = require("./routes/owner.routes.js");

//routes declare
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", ownerRouter);

module.exports = app;
