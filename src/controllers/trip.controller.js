const Trip = require("../models/trip.model");
const Car = require("../models/car.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const Invoice = require("../models/invoice.model.js");
const Owner = require("../models/owner.model.js");

function generateInvoiceId(model) {
	// Define character sets for readability
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	// Generate a unique identifier
	let uniqueIdentifier = "";
	for (let i = 0; i < 5; i++) {
		uniqueIdentifier += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	// Combine prefix and unique identifier
	return `${model.toUpperCase().substring(0, 3)}-${uniqueIdentifier}`;
}

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

// ?? update offroad days
exports.updateOffroad = catchAsyncErrors(async (req, res) => {
	const { offroad } = req.body;
	const trip = await Trip.findById(req.query.id).populate("car");
	console.log("offroad = ", offroad);
	if (!trip) {
		throw new ApiError(404, "Trip not found!");
	}
	if (trip.status === "completed") {
		throw new ApiError(404, "Trip already completed");
	}

	const startDate = new Date(trip.start.date);
	for (const date of offroad.dates) {
		console.log(date);
		const currentDate = new Date(date);
		if (currentDate >= startDate) {
			// Check if date is already present in offroad_date
			console.log(trip.offroad_date.includes(date));
			if (!trip.offroad_date.includes(date.toString())) {
				trip.offroad_date.push(date);
				trip.offroad++;
			}
		}
	}
	await trip.save();

	const date = await Trip.findById(req.query.id);
	console.log("backend date = ", date.offroad_date);

	res.status(201).json(new ApiResponse(200, {}, "offroad day added successfully."));
});

// ?? update trips
exports.completeTrip = catchAsyncErrors(async (req, res) => {
	const { end } = req.body;
	const trip = await Trip.findById(req.query.id).populate("car");
	// console.log(trip);

	if (!trip) {
		throw new ApiError(404, "Trip not found!");
	}
	if (trip.status === "completed") {
		throw new ApiError(404, "Trip already completed");
	}
	if (trip.generated.includes(new Date().toISOString().split("T")[0])) {
		trip.status = "completed";
		await trip.save();
		res.status(200).json(new ApiResponse(200, trip, "Trip completed successfully."));
	}
	if (trip.start.km > end.km) {
		throw new ApiError(401, "end km is not greater than start km");
	}

	trip.end = end;
	await trip.save();

	const dayqty = Math.ceil((trip.end.date - trip.start.date) / (1000 * 60 * 60 * 24)) + 1;
	const kmqty = Math.ceil(trip.end.km - trip.start.km);

	const dayAmount = (dayqty - trip.offroad) * trip.car.rate.date;
	const kmAmount = kmqty * trip.car.rate.km;

	const total = dayAmount + kmAmount;
	const gstTotal = (total * 5) / 100;
	const billTotal = (gstTotal + total).toFixed(2);

	const invoiceId = generateInvoiceId(trip.car.model);

	const invoice = await Invoice.create({
		owner: trip.car.owner,
		trip: trip._id.toString(),
		invoiceId,
		car: trip.car._id,
		model: trip.car.model,
		dayQty: dayqty,
		dayRate: trip.car.rate.date,
		dayAmount: dayAmount.toFixed(2),
		kmQty: kmqty,
		kmRate: trip.car.rate.km,
		from: trip.start.date,
		fromkm: trip.start.km,
		tokm: end.km,
		to: end.date,
		kmAmount: kmAmount.toFixed(2),
		totalAmount: total.toFixed(2),
		offroad: trip.offroad,
		gstAmount: gstTotal.toFixed(2),
		billAmount: billTotal,
	});

	const owner = await Owner.findById(trip.car.owner);

	if (!owner) {
		// throw new ApiError(404, "Owner not found");
		// console.log("invoice is not added to owner because owner not found");
	} else {
		owner.invoices.push(invoice._id);
		await owner.save();
	}

	trip.status = "completed";
	trip.generated.push(new Date().toISOString().split("T")[0]);

	const car = await Car.findById(trip.car);

	car.amount += Number(total);
	car.totalkm = kmqty + car.start.km;
	car.dayAmount += Number(dayAmount);
	car.kmAmount += Number(kmAmount);

	trip.status = "completed";
	trip.start = {
		date: trip.end.date,
		km: trip.end.km,
	};
	trip.offroad = 0;
	car.trip.pull(trip._id);

	await car.save();
	await trip.save();

	res.status(201).json(new ApiResponse(200, invoice, "Trip Completed successfully."));
});

// ?? get all trips
exports.getAllTrips = catchAsyncErrors(async (req, res) => {
	const trips = await Trip.find().populate("car");
	// console.log(trips);

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
