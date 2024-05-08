const Invoice = require("../models/invoice.model.js");
const Car = require("../models/car.model");
const Trip = require("../models/trip.model");
const Owner = require("../models/owner.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

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

exports.generateInvoice = catchAsyncErrors(async (req, res) => {
	const { tripId, status, end } = req.body;
	const trip = await Trip.findOne({ tripId }).populate("car");

	if (!trip) {
		throw new ApiError(404, "Trip not found");
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
		console.log("invoice is not added to owner because owner not found");
	} else {
		owner.invoices.push(invoice._id);
		await owner.save();
	}

	trip.generated.push(new Date().toISOString().split("T")[0]);

	const car = await Car.findById(trip.car);
	car.amount += Number(total);
	car.totalkm = kmqty + car.start.km;
	car.dayAmount += Number(dayAmount);
	car.kmAmount += Number(kmAmount);
	if (status === false) {
		trip.status = "completed";
		trip.start = {
			date: trip.end.date,
			km: trip.end.km,
		};
		trip.offroad = 0;
		car.trip.pull(trip._id);
	} else {
		trip.start = {
			date: trip.end.date,
			km: trip.end.km,
		};
		trip.offroad = 0;
	}
	await car.save();
	await trip.save();

	res.status(201).json(new ApiResponse(200, invoice, "Invoice generated successfully."));
});

exports.generateInvoices = catchAsyncErrors(async (req, res) => {
	const currentDate = new Date();
	// TODO: need to change === to !== as invoice is only generated on the 1st of every month
	// if (currentDate.getDate() === 1) {
	// 	throw new ApiError(403, "Invoices can only be generated on the 1st day of the month.");
	// }

	const cars = await Car.find().populate("owner"); // Populate the owner field in the Car document
	if (!cars || cars.length === 0) {
		throw new ApiError(404, "No cars found.");
	}

	const trips = await Trip.aggregate([
		{
			$match: {
				generated: {
					$not: {
						$elemMatch: {
							invoiceGenerationMonth: { $eq: currentDate.getMonth() },
						},
					},
				},
				status: "ongoing",
			},
		},
		{
			$lookup: {
				from: "cars",
				localField: "car",
				foreignField: "_id",
				as: "carDetails",
			},
		},
		{ $unwind: "$carDetails" }, // Deconstruct the carDetails array
		{
			$lookup: {
				from: "owners",
				localField: "carDetails.owner",
				foreignField: "_id",
				as: "ownerDetails",
			},
		},
		{ $unwind: "$ownerDetails" }, // Deconstruct the ownerDetails array
	]);

	// console.log(trips);

	if (!trips || trips.length === 0) {
		throw new ApiError(404, "No trips found to generate invoices.");
	}

	const { end } = req.body;

	if (!end || end.length === 0) {
		throw new ApiError(400, "End kilometers are required.");
	}

	const endMap = new Map(end.map(({ email, km }) => [email, km]));

	const invoicePromises = [];
	const generatedInvoices = [];
	console.log("************************************************************************************************");
	for (const trip of trips) {
		const car = trip.carDetails;
		const carWithOwner = cars.find((c) => c._id.toString() === car._id.toString()); // Find the car from the populated cars array
		if (!carWithOwner) {
			throw new ApiError(404, "Car not found.");
		}
		const owner = carWithOwner.owner; // Access owner from the car document
		const model = car.model;
		const days = Math.ceil((currentDate - trip.start.date) / (1000 * 60 * 60 * 24));
		const endKm = endMap.get(owner.email); // Get the end kilometer for the respective owner

		if (!endKm) {
			throw new ApiError(400, `End kilometer not provided for owner with email ${owner.email}.`);
		}
		// console.log("car", car);
		const dayAmount = days * car.rate.date;
		const kmAmount = (endKm - trip.start.km) * car.rate.km; // Calculate kilometers based on end kilometer
		const totalAmount = dayAmount + kmAmount;

		const tripDocument = await Trip.findById(trip._id);
		if (!tripDocument) {
			throw new ApiError(404, "Trip not found.");
		}

		tripDocument.end = {
			date: currentDate,
			km: endKm,
		};

		await tripDocument.save();

		const newInvoice = new Invoice({
			owner: owner,
			trip: trip._id,
			model: model,
			dayQty: days,
			dayRate: car.rate.date,
			dayAmount: dayAmount,
			kmQty: endKm - trip.start.km, // Calculate kilometers difference
			kmRate: car.rate.km,
			kmAmount: kmAmount,
			totalAmount: totalAmount,
		});

		await newInvoice.save(); // Wait for the invoice to be saved before pushing to the array
		generatedInvoices.push(newInvoice.toObject());

		// Update car's kilometers
		carWithOwner.currentKm = endKm;
		await carWithOwner.save();
	}

	// Mark trips as invoiced
	const tripIds = trips.map((trip) => trip._id);
	await Trip.updateMany({ _id: { $in: tripIds } }, { $push: { generated: currentDate } });

	res.status(201).json(new ApiResponse(200, generatedInvoices, "Invoices generated successfully."));
});

exports.getAllInvoices = catchAsyncErrors(async (req, res) => {
	const allInvoices = await Invoice.find().populate("owner");

	if (!allInvoices || allInvoices.length === 0) {
		throw new ApiError(404, "No invoices found in the database.");
	}
	// Create an empty array to store formatted invoices
	const formattedInvoices = [];

	allInvoices.forEach((invoice) => {
		// Check if the owner is already present in formattedInvoices
		const ownerIndex = formattedInvoices.findIndex((ownerInvoices) => {
			return ownerInvoices.owner._id.toString() === invoice.owner._id.toString();
		});

		// If owner is not present, add the owner along with the current invoice
		if (ownerIndex === -1) {
			formattedInvoices.push({
				owner: invoice.owner,
				invoices: [
					{
						model: invoice.model,
						invoice: [
							{
								_id: invoice._id,
								invoiceId: invoice.invoiceId,
								model: invoice.model,
								dayQty: invoice.dayQty,
								dayRate: invoice.dayRate,
								dayAmount: invoice.dayAmount,
								kmQty: invoice.kmQty,
								offroad: invoice.offroad,
								kmRate: invoice.kmRate,
								kmAmount: invoice.kmAmount,
								totalAmount: invoice.totalAmount,
								invoiceDate: invoice.invoiceDate,
								from: invoice.from,
								to: invoice.to,
								status: invoice.status,
							},
						],
					},
				],
			});
		} else {
			// If owner is already present, find the model index
			const modelIndex = formattedInvoices[ownerIndex].invoices.findIndex((inv) => {
				return inv.model === invoice.model;
			});

			// If model is not present, add the model along with the current invoice
			if (modelIndex === -1) {
				formattedInvoices[ownerIndex].invoices.push({
					model: invoice.model,
					invoice: [
						{
							_id: invoice._id,
							invoiceId: invoice.invoiceId,
							model: invoice.model,
							dayQty: invoice.dayQty,
							dayRate: invoice.dayRate,
							offroad: invoice.offroad,
							dayAmount: invoice.dayAmount,
							kmQty: invoice.kmQty,
							kmRate: invoice.kmRate,
							kmAmount: invoice.kmAmount,
							totalAmount: invoice.totalAmount,
							invoiceDate: invoice.invoiceDate,
							from: invoice.from,
							to: invoice.to,
							status: invoice.status,
						},
					],
				});
			} else {
				// If model is already present, add the current invoice
				formattedInvoices[ownerIndex].invoices[modelIndex].invoice.push({
					_id: invoice._id,
					invoiceId: invoice.invoiceId,
					model: invoice.model,
					dayQty: invoice.dayQty,
					dayRate: invoice.dayRate,
					dayAmount: invoice.dayAmount,
					kmQty: invoice.kmQty,
					kmRate: invoice.kmRate,
					kmAmount: invoice.kmAmount,
					offroad: invoice.offroad,
					totalAmount: invoice.totalAmount,
					invoiceDate: invoice.invoiceDate,
					from: invoice.from,
					to: invoice.to,
					status: invoice.status,
				});
			}
		}
	});

	res.status(200).json(new ApiResponse(200, formattedInvoices, "All invoices retrieved successfully."));
});

exports.payInvoices = catchAsyncErrors(async (req, res) => {
	const { id } = req.query;
	const invoice = await Invoice.findById(id).populate("owner");

	if (!invoice) {
		throw new ApiError(404, "invoice not found in the database.");
	}

	invoice.status = "paid";
	await invoice.save();

	res.status(200).json(new ApiResponse(200, invoice, "Invoice Payment Successful"));
});

exports.getSingleInvoice = catchAsyncErrors(async (req, res) => {
	const { id } = req.query;
	const invoice = await Invoice.findById(id).populate("owner car");

	if (!invoice) {
		throw new ApiError(404, "invoice not found in the database.");
	}

	res.status(200).json(new ApiResponse(200, invoice, "Invoice Payment Successful"));
});

exports.getIndividualInvoices = catchAsyncErrors(async (req, res) => {
	const allInvoices = await Invoice.find().populate("owner trip car");

	if (!allInvoices || allInvoices.length === 0) {
		throw new ApiError(404, "No invoices found in the database.");
	}

	res.status(200).json(new ApiResponse(200, allInvoices, "All invoices retrieved successfully."));
});
