const Invoice = require("../models/invoice.model.js");
const Car = require("../models/car.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.generateInvoice = catchAsyncErrors(async (req, res) => {
	const { owner, date, rental, maintainance } = req.body;

	if (![owner, date, rental, maintainance].every((field) => field !== undefined && field !== null)) {
		throw new ApiError(400, "All fields are required");
	}

	const invoice = await Invoice.create(owner, date, rental, maintainance);

	if (!invoice) {
		throw new ApiError(404, "Trip Not Found");
	}

	console.log(invoice);

	console.log(owner, date, rental, maintainance);

	// return res.status(200).json(new ApiResponse(200, trip, "Trip Assigned Successfully"));
});
