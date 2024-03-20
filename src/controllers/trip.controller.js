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
	const startdate = new Date(start.date); // Convert start date to a Date object

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
		endkm = end.km;
		enddate = new Date(end.date);

		trip = await Trip.create({
			route: { source, destination },
			tripStatus,
			start: { km: startkm, date: startdate.toISOString() },
			end: { km: endkm, date: enddate.toISOString() },
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
	if (trip?.end) {
		car = trip.end;
	}
	car.rate = rate;

	await car.save();

	trip.car = carId;

	await trip.save();

	return res.status(200).json(new ApiResponse(200, trip, "Trip Assigned Successfully"));
});

exports.markTripasCompleted = catchAsyncErrors(async (req, res) => {
	const { id } = req.query;
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
	await trip.save();
	const driver = await Driver.findById(trip.driver);
	if (!driver) {
		throw new ApiError(404, "Driver Not Found");
	}
	driver.status = "available";
	driver.trips[0].status = "completed";
	await driver.save();
	res.status(200).json(new ApiResponse(200, trip, "Trip Marked as Completed Successfully"));
});
