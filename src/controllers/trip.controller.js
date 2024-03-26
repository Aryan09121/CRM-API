const Trip = require("../models/trip.model");
const Car = require("../models/car.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.addTrip = catchAsyncErrors(async (req, res) => {
	const { carId, district, year, frvCode, start, end } = req.body;

	// Check if carId is provided
	if (!carId) {
		throw new ApiError(404, "Car ID is required.");
	}

	// Create a new trip instance
	const trip = new Trip({
		car: carId,
		district,
		year,
		frvCode,
		start: {
			date: start.date,
			km: start.km,
		},
		end: {
			date: end.date,
			km: end.km,
		},
	});

	// Save the trip
	await trip.save();
	res.status(201).json(new ApiResponse(200, trip, "Trip added successfully."));
});

exports.markTripasCompleted = catchAsyncErrors(async (req, res) => {
	const { id } = req.query;
	const { end } = req.body;

	const trip = await Trip.findById(id);
	if (!trip) {
		throw new ApiError(404, "Trip Not Found");
	}
	if (trip.tripStatus === "completed") {
		throw new ApiError(404, "Trip Already Completed");
	}

	trip.tripStatus = "completed";

	if (!trip.endingDate) {
		trip.endingDate = new Date();
	}

	trip.end = {
		km: end.km,
		date: parseDate(end.date).toISOString(),
	};

	await trip.save();

	const car = await Car.findById(trip.car);
	car.tripStatus = "completed";

	await car.save();

	res.status(200).json(new ApiResponse(200, trip, "Trip Marked as Completed Successfully"));
});

const parseDate = (dateString) => {
	const parts = dateString.split("/");
	// Parts[2] contains year, parts[1] contains month, parts[0] contains day
	return new Date(parts[2], parts[1] - 1, parts[0]); // Month is zero-based
};
