const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { generatedErrors } = require("./middlewares/errors");
const { ApiError } = require("./utils/ApiError");

const app = express();

app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// models import
// const User = require("./models/user.model.js");
// const Owner = require("./models/owner.model.js");
// const Car = require("./models/car.model.js");
// const Driver = require("./models/driver.model.js");

// routes import

const userRouter = require("./routes/user.routes.js");
const ownerRouter = require("./routes/owner.routes.js");
const carRouter = require("./routes/car.routes.js");
// const tripRouter = require("./routes/trip.routes.js");

//routes declare
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", ownerRouter);
app.use("/api/v1/admin", carRouter);
// app.use("/api/v1/admin", tripRouter);

app.all("*", (req, res, next) => {
	next(new ApiError(404, `Requested URL Not Found ${req.url}`));
});
app.use(generatedErrors);

module.exports = app;
