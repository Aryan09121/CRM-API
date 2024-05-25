const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { generatedErrors } = require("./middlewares/errors");
const { ApiError } = require("./utils/ApiError");
const path = require("path");

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

// routes import

const userRouter = require("./routes/user.routes.js");
const ownerRouter = require("./routes/owner.routes.js");
const carRouter = require("./routes/car.routes.js");
const tripRouter = require("./routes/trip.routes.js");
const invoiceRouter = require("./routes/invoice.routes.js");
const companyRouter = require("./routes/company.routes.js");
const settingsRouter = require("./routes/settings.routes.js");
const uploadsRouter = require("./routes/uploads.routes.js");

//routes declare
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", ownerRouter);
app.use("/api/v1/admin", carRouter);
app.use("/api/v1/admin", tripRouter);
app.use("/api/v1/admin", invoiceRouter);
app.use("/api/v1/admin", companyRouter);
app.use("/api/v1/admin", settingsRouter);
app.use("/api/v1/admin", uploadsRouter);

// ?? multer image saving
app.use("/", express.static(path.join(__dirname, "..", "/public", "/uploads")));

app.all("*", (req, res, next) => {
	next(new ApiError(404, `Requested URL Not Found ${req.url}`));
});
app.use(generatedErrors);

module.exports = app;
