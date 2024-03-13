const Trip = require("../models/trip.model");
const Driver = require("../models/driver.model");
const Car = require("../models/car.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.addTrip = catchAsyncErrors(async (req, res) => {
	const { startKm, startDate, endDate, driverId, carId } = req.body;
	console.log("cron works");

	const driver = await Driver.findById(driverId);
	if (!driver) {
		throw new ApiError(404, "Driver is Required!");
	}
	if (driver.status !== "available") {
		throw new ApiError(404, "Driver is Already assigned a Trip");
	}
	const car = await Car.findById(carId);
	if (!car) {
		throw new ApiError(404, "Car is Required!");
	}

	// Retrieve the driver's last trip
	const lastTrip = driver.trips[0];

	// If the last trip exists, update its status to "completed"
	if (lastTrip) {
		lastTrip.status = "completed";
		await lastTrip.save();
	}

	const trip = await Trip.create({
		startKm,
		startDate: startDate || Date.now(),
		endingDate: endDate || null,
	});

	if (!trip) {
		throw new ApiError(500, "Something went wrong While Assigning a trip!");
	}

	trip.driver = driverId;
	trip.car = carId;

	const newTrip = await trip.save();

	driver.trips.unshift({
		status: newTrip.status,
		trip: newTrip._id,
	});

	driver.status = "ontrip";
	if (!driver.cars.includes(newTrip.car)) {
		driver.cars.unshift(newTrip.car);
	}

	await driver.save();

	res.status(200).json(new ApiResponse(200, newTrip, "Trip Assignment Successfully"));
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
