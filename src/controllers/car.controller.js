const { ApiError } = require("../utils/ApiError.js");
const Owner = require("../models/owner.model");
const Car = require("../models/car.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.getCars = catchAsyncErrors(async (req, res) => {
	const cars = await Car.find();
	if (!cars) {
		throw new ApiError(404, "cars Not Found");
	}
	res.status(200).json(new ApiResponse(200, cars, "cars fetched successfully"));
});
