const { ApiError } = require("../utils/ApiError.js");
const Driver = require("../models/driver.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.addDriver = catchAsyncErrors(async (req, res) => {
	const { name, contact, gender, email } = req.body;

	const isDriverExist = Driver.find({ name, contact, email });
	if (isDriverExist) {
		throw new ApiError(400, `Driver ${name} already exists`);
	}

	const driver = Driver.create({ name, contact, gender, email });

	if (!driver) {
		throw new ApiError(500, "Some error occured while registering driver");
	}

	res.status(200).json(new ApiResponse(200, driver, "Driver registered successfully"));
});
