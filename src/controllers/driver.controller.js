const { ApiError } = require("../utils/ApiError.js");
const Driver = require("../models/driver.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

// ?? add new driver handler
exports.addDriver = catchAsyncErrors(async (req, res) => {
	const { name, contact, gender, email } = req.body;

	if ([name, contact, gender, email].some((field) => field?.trim() === "")) {
		throw new ApiError(400, "All fields are required");
	}

	const isDriverExist = await Driver.findOne({ name, contact, email });
	if (isDriverExist) {
		throw new ApiError(400, `Driver ${name} already exists`);
	}

	const driver = await Driver.create({ name, contact, gender, email });

	if (!driver) {
		throw new ApiError(500, "Some error occured while registering driver");
	}

	console.log(driver);

	res.status(200).json(new ApiResponse(200, driver, "Driver registered successfully"));
});

// update driver accident history handler
exports.updateAccidentHistory = catchAsyncErrors(async (req, res) => {
	const { name, contact, gender, email } = req.body;

	if ([name, contact, gender, email].some((field) => field?.trim() === "")) {
		throw new ApiError(400, "All fields are required");
	}

	const isDriverExist = await Driver.findOne({ name, contact, email });
	if (isDriverExist) {
		throw new ApiError(400, `Driver ${name} already exists`);
	}

	const driver = await Driver.create({ name, contact, gender, email });

	if (!driver) {
		throw new ApiError(500, "Some error occured while registering driver");
	}

	console.log(driver);

	res.status(200).json(new ApiResponse(200, driver, "Driver registered successfully"));
});
