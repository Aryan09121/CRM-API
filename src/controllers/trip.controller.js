const Trip = require("../models/trip.model");
const Car = require("../models/car.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.addTrip = catchAsyncErrors(async (req, res) => {
	const { source, destination, start, frvcode, carId, rate, end } = req.body;

	if ([source, destination].some((field) => field?.trim() === "")) {
		throw new ApiError(400, "All fields are required");
	}

	const startkm = start.km;
	const startdate = parseDate(start.date);

	// Calculate the difference in days between startdate and today's date
	const timeDifference = startdate.getTime() - Date.now();
	const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

	let tripStatus;
	if (daysDifference === 0) {
		tripStatus = "ongoing"; // Trip is scheduled for today
	} else if (daysDifference > 0) {
		tripStatus = "upcoming"; // Trip is scheduled for the future
	} else {
		tripStatus = "past"; // Trip has already occurred
	}
	let trip;
	if (end) {
		const endkm = end.km;
		const enddate = parseDate(end.date);

		trip = await Trip.create({
			route: { source, destination },
			tripStatus,
			start: { km: startkm, date: startdate.toISOString() },
			end: { km: endkm, date: enddate.toISOString() }, // Using toISOString for enddate
		});
	} else {
		trip = await Trip.create({
			route: { source, destination },
			tripStatus,
			start: { km: startkm, date: startdate.toISOString() },
		});
	}

	if (!trip) {
		throw new ApiError(500, "Something went wrong while assigning a trip!");
	}

	const car = await Car.findById(carId);
	car.frvcode = frvcode;

	car.start = {
		km: trip.start.km,
		date: trip.start.date,
	};
	if (trip.end) {
		car.end = {
			km: end.km,
			date: parseDate(end.date).toISOString(),
		};
	}
	car.rate = rate;

	await car.save();

	trip.car = carId;

	await trip.save();

	return res.status(200).json(new ApiResponse(200, trip, "Trip Assigned Successfully"));
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
