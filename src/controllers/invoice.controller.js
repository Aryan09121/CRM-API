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

	// Parse invoice date
	const invDate = parseDate(date);

	// Parse rental period dates
	const parsedRental = rental.map((item) => ({
		...item,
		period: {
			from: parseDate(item.period.from),
			to: parseDate(item.period.to),
		},
	}));

	// Create invoice
	const invoice = await Invoice.create({ owner, date: invDate, rental: parsedRental, maintainance });

	if (!invoice) {
		throw new ApiError(404, "Invoice creation failed");
	}

	const inv = await Invoice.findById(invoice._id)
		.populate({
			path: "owner",
			model: "owner", // Assuming the model name for owner is 'Owner'
		})
		.populate({
			path: "rental.cars",
			model: "Car", // Assuming the model name for cars is 'Car'
		});
	if (!inv) {
		throw new ApiError(404, "Invoice not found");
	}

	console.log(inv);

	// return res.status(200).json(new ApiResponse(200, trip, "Trip Assigned Successfully"));
});

const parseDate = (dateString) => {
	const parts = dateString.split("/");
	// Parts[2] contains year, parts[1] contains month, parts[0] contains day
	return new Date(parts[2], parts[1] - 1, parts[0]); // Month is zero-based
};
