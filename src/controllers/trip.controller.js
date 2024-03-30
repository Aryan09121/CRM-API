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

	// Generate a unique tripId
	const tripId = generateTripId();

	// Create a new trip instance
	const trip = new Trip({
		car: carId,
		tripId: tripId,
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

function generateTripId() {
	// Logic to generate a unique tripId, you can use any unique identifier generation method
	// For example, you can use UUID package or generate a unique combination of date and time
	return "TRIP_" + Date.now(); // Example: TRIP_1636722075793
}

const parseDate = (dateString) => {
	const parts = dateString.split("/");
	// Parts[2] contains year, parts[1] contains month, parts[0] contains day
	return new Date(parts[2], parts[1] - 1, parts[0]); // Month is zero-based
};
