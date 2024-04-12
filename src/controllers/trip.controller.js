const Trip = require("../models/trip.model");
const Car = require("../models/car.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.addTrip = catchAsyncErrors(async (req, res) => {
	const { registrationNo, district, year, frvCode, start } = req.body;

	// Check if carId is provided
	if (!registrationNo) {
		throw new ApiError(404, "Registration number is required.");
	}

	if (!district && !year && !frvCode && !start) {
		throw new ApiError(404, "All Fields is required.");
	}

	const car = await Car.find({ registrationNo: registrationNo });

	if (!car) {
		throw new ApiError(404, "car Not Found");
	}

	// Generate a unique tripId
	const tripId = generateTripId();

	// Create a new trip instance
	const trip = new Trip({
		car: car._id,
		tripId: tripId,
		district,
		year,
		frvCode,
		start: {
			date: start.date,
			km: start.km,
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
