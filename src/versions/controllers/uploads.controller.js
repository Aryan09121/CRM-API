const { ApiError } = require("../utils/ApiError.js");
const Owner = require("../models/owner.model");
const Car = require("../models/car.model.js");
const Trip = require("../models/trip.model.js");
const Invoice = require("../models/invoice.model.js");
const Company = require("../models/company.model.js");
const Setting = require("../models/settings.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

function padDigits(number, digits) {
	return String(number).padStart(digits, "0");
}

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

exports.addCars = catchAsyncErrors(async (req, res) => {
	const { cars } = req.body;

	for (const car of cars) {
		const owner = await Owner.findOne({ "registration.registrationNo": car.registrationNo });
		if (!owner) {
			throw new ApiError(404, "Owner Not Found");
		}

		const isCarPresent = await Car.findOne({ registrationNo: car.registrationNo });
		if (isCarPresent) {
			throw new ApiError(404, "Car is already present");
		}

		const cardata = await Car.create({
			model: car.model,
			brand: car.brand,
			registrationNo: car.registrationNo,
			start: car.start,
			rate: car.rate,
			owner: owner._id,
		});

		if (!cardata) {
			throw new ApiError(404, "cars Not Added!");
		}
		owner.cars.push(cardata._id);
		await owner.save();
	}

	res.status(200).json(new ApiResponse(200, {}, "car added successfully"));
});

exports.addMultipleOwner = catchAsyncErrors(async (req, res) => {
	const owners = req.body;

	if (owners.length === 0) {
		throw new ApiError(400, "Owners list cannot be empty");
	}

	for (const owner of owners) {
		const isOwnerExists = await Owner.findOne({ contact: owner.phone });
		if (isOwnerExists) {
			throw new ApiError(409, "User with given credentials already exists");
		}

		const { name, phone: contact, address, account, bankName, ifsc, registration } = owner;
		// Create the owner without cars
		const createdOwner = await Owner.create({
			name,
			contact,
			address,
			account,
			ifsc,
			bankName,
			registration,
			joinedDate: Date.now(),
		});
		if (!createdOwner) {
			throw new ApiError(500, "Something went wrong while Adding the Owner");
		}
	}

	return res.status(200).json(new ApiResponse(200, {}, "Owners Added Successfully"));
});

// ??!!  invoice genration and data mixing
exports.handleTripsInvoices = catchAsyncErrors(async (req, res) => {
	const data = req.body;
	console.log("************************************************************************************************");
	for (const registrationNo in data.carStats) {
		if (Object.hasOwnProperty.call(data.carStats, registrationNo)) {
			const carStat = data.carStats[registrationNo];
			const car = await Car.findOne({ registrationNo });
			if (!car) {
				throw new ApiError(404, "Car Not Found");
			}
			car.totalkm = carStat.totalKmTraveled;
			car.totalDays = carStat.totalDays;
			car.rent = carStat.rent;
			car.ownerAmount = carStat.ownerAmount;
			car.offroad = carStat.offroad;
			car.dayAmount = Number((carStat.totalDays * car.rate.date).toFixed(2));
			car.kmAmount = Number((carStat.totalKmTraveled * car.rate.km).toFixed(2));

			await car.save();
		}
	}

	// !! trip creation
	for (const registrationNo in data.carStats) {
		if (Object.hasOwnProperty.call(data.carStats, registrationNo)) {
			const carStat = data.carStats[registrationNo];
			const car = await Car.findOne({ registrationNo });
			if (!car) {
				throw new ApiError(404, "Car Not Found");
			}
			for (const trip of carStat.trips) {
				console.log(trip.company);
				const company = await Company.findById(trip.company);
				if (!company) {
					throw new ApiError(404, "Company Not Found");
				}
				const isTripPresent = await Trip.findOne({ car: car._id, company: company._id });
				if (isTripPresent) {
					console.log("trip is already present");
					isTripPresent.months.push({
						month: trip.month,
						startDate: trip.startDate,
						endDate: new Date(trip.endDate.toString()),
						startKm: trip.startKm,
						endKm: trip.endKm,
						offroad: trip.offroad,
					});
					isTripPresent.generated.push(trip.month);
					await isTripPresent.save();
					continue;
				}

				const newTrip = await Trip.create({
					district: trip.district,
					company: company._id,
					start: {
						date: trip.startDate,
						km: trip.startKm,
					},
					end: {
						date: trip.endDate,
						km: trip.endKm,
					},
					car: car._id,
					frvCode: trip.frvCode,
					tripId: generateTripId(trip.district, trip.frvCode),
					offroad: trip.offroad,
				});
				newTrip.generated.push(trip.month);
				newTrip.months.push({
					month: trip.month,
					startDate: trip.startDate,
					endDate: trip.endDate,
					startKm: trip.startKm,
					endKm: trip.endKm,
					offroad: trip.offroad,
				});
				await newTrip.save();
				car.trip.push(newTrip._id);
			}
			await car.save();
		}
	}

	// !! invoice creation
	for (const registrationNo in data.carStats) {
		if (Object.hasOwnProperty.call(data.carStats, registrationNo)) {
			const carStat = data.carStats[registrationNo];
			const car = await Car.findOne({ registrationNo });
			if (!car) {
				throw new ApiError(404, "Car Not Found");
			}
			const owner = await Owner.findOne({ _id: car.owner });
			if (!owner) {
				throw new ApiError(404, "Owner Not Found");
			}
			const company = await Company.findById(carStat.companyId);
			const setting = await Setting.findOne();
			const invId = generateInvoiceId(car.model);
			const invoice = await Invoice.create({
				owner: owner._id,
				car: car._id,
				invoiceId: invId,
				company: company._id,
			});

			// Initialize invoice fields to avoid NaN
			invoice.dayQty = 0;
			invoice.kmQty = 0;
			invoice.offroad = 0;
			invoice.dayAmount = 0;
			invoice.kmAmount = 0;
			invoice.totalAmount = 0;
			invoice.gstAmount = 0;
			invoice.billAmount = 0;

			for (const trip of carStat.trips) {
				invoice.model = trip.model;
				invoice.dayQty += Number(trip.totalDays) || 0;
				invoice.kmQty += Number(trip.totalKm) || 0;
				invoice.offroad += trip.offroad || 0;
				invoice.dayAmount += Number((trip.totalDays * trip.rate.date).toFixed(2)) || 0;
				invoice.kmAmount += Number((trip.totalKm * trip.rate.km).toFixed(2)) || 0;
				invoice.totalAmount += Number((trip.totalDays * trip.rate.date + trip.totalKm * trip.rate.km).toFixed(2)) || 0;
				invoice.gstAmount = Number(((invoice.totalAmount * setting.gstValue) / 100).toFixed(2));
				invoice.billAmount = invoice.totalAmount + invoice.gstAmount;

				let from, to, fromkm, tokm;
				from = trip.startDate;
				to = trip.endDate;
				fromkm = trip.startKm;
				tokm = trip.endKm;
				if (from > trip.startDate) {
					from = trip.startDate;
				}
				if (to < trip.endDate) {
					to = trip.endDate;
				}
				if (fromkm > trip.startKm) {
					fromkm = trip.startKm;
				}
				if (tokm < trip.endKm) {
					toKm = trip.endKm;
				}
				invoice.from = from;
				invoice.to = to;
				invoice.fromkm = fromkm;
				invoice.tokm = tokm;
				invoice.months.push({
					startDate: trip.startDate,
					endDate: trip.endDate,
					startKm: trip.startKm,
					endKm: trip.endKm,
					offroad: trip.offroad,
					invoiceDate: trip.endDate,
					days: trip.totalDays,
					rate: trip.rate,
					rent: trip.rent,
					totalDays: trip.totalDays - trip.offroad,
					dayAmount: Number((trip.totalDays * trip.rate.date).toFixed(2)),
					kmAmount: Number((trip.totalKm * trip.rate.km).toFixed(2)),
					totalAmount: Number(((trip.totalDays - trip.offroad) * trip.rate.date + trip.totalKm * trip.rate.km).toFixed(2)),
					gstAmount: Number(
						((((trip.totalDays - trip.offroad) * trip.rate.date + trip.totalKm * trip.rate.km) * setting.gstValue) / 100).toFixed(2)
					),
					billAmount: Number(
						(
							(trip.totalDays - trip.offroad) * trip.rate.date +
							trip.totalKm * trip.rate.km +
							(((trip.totalDays - trip.offroad) * trip.rate.date + trip.totalKm * trip.rate.km) * setting.gstValue) / 100
						).toFixed(2)
					),
				});
			}
			await invoice.save();
			owner.invoices.push(invoice._id);
			await owner.save(); // Don't forget to save the owner after pushing the invoice
		}
	}

	return res.status(200).json(new ApiResponse(200, {}, "data uploaded Successfully"));
});
