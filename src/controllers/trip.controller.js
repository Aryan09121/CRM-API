const Trip = require("../models/trip.model");
const Car = require("../models/car.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

// ?? get all trips
exports.addTrip = catchAsyncErrors(async (req, res) => {
	const { registrationNo, district, year, frvCode, start } = req.body;

	// Check if carId is provided
	if (!registrationNo) {
		throw new ApiError(404, "Registration number is required.");
	}

	if (!district && !year && !frvCode && !start) {
		throw new ApiError(404, "All Fields is required.");
	}

	const car = await Car.findOne({ registrationNo: registrationNo });

	if (!car) {
		throw new ApiError(404, "car Not Found");
	}

	if (start.km < car.start.km) {
		throw new ApiError(404, "start km is too low");
	}

	const kmdiff = start.km - car.totalkm;

	// Create a new trip instance
	const trip = new Trip({
		car: car._id,
		district,
		year,
		frvCode,
		start: {
			date: start.date,
			km: start.km,
		},
	});

	if (!trip) {
		throw new ApiError(404, "Internal server error while creating a trip");
	}

	const id = generateTripId(trip.district, trip.frvCode);

	trip.tripId = id;
	car.totalkm += kmdiff;
	car.trip.push(trip._id);
	await car.save();
	await trip.save();
	res.status(201).json(new ApiResponse(200, trip, "Trip added successfully."));
});

// ?? update trips
exports.completeTrip = catchAsyncErrors(async (req, res) => {
	const trip = Trip.findById(req.query.id);

	if (!trip) {
		throw new ApiError(404, "Trip not found!");
	}
	if (trip.status === "completed") {
		throw new ApiError(404, "Trip already completed");
	}
	if (trip.generated.includes(new Date().toISOString().split("T")[0])) {
		console.log("hellow");
		throw new ApiError(403, "Invoice already generated for today");
	}
	if (trip.start.km > end.km) {
		throw new ApiError(401, "end km is not greater than start km");
	}

	trip.status = "completed";
	trip.generated.push(new Date());

	res.status(201).json(new ApiResponse(200, trip, "Trip added successfully."));
});

// ?? get all trips
exports.getAllTrips = catchAsyncErrors(async (req, res) => {
	const trips = await Trip.find().populate("car");
	console.log(trips);

	if (!trips || trips.length === 0) {
		res.status(201).json(new ApiResponse(200, [], "no trips found."));
	}
	res.status(201).json(new ApiResponse(200, trips, "Trips fetched Successfully."));
});

function generateTripId(district, frvCode) {
	// Extract first three letters from district name
	const districtPrefix = district.substring(0, 3).toUpperCase();

	// Generate a random index within the range of frvCode length
	const randomIndex = Math.floor(Math.random() * (frvCode.length - 2)); // Subtracting 2 to ensure the substring length is at least 1

	// Extract a random substring from frvCode
	const frvCodePrefix = frvCode.substring(randomIndex, randomIndex + 3).toUpperCase();

	// Generate unique identifier (e.g., using Date.now() with padding)
	const uniqueIdentifier = padDigits(Date.now() % 1000, 3);

	// Combine "TRIP-" prefix, district prefix, frvCode prefix, and unique identifier
	return `TRIP-${districtPrefix}${frvCodePrefix}${uniqueIdentifier}`;
}

// Function to pad a number with leading zeros to ensure a fixed length
function padDigits(number, digits) {
	return String(number).padStart(digits, "0");
}

const parseDate = (dateString) => {
	const parts = dateString.split("/");
	// Parts[2] contains year, parts[1] contains month, parts[0] contains day
	return new Date(parts[2], parts[1] - 1, parts[0]); // Month is zero-based
};
