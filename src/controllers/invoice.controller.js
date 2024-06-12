const Invoice = require("../models/invoice.model.js");
const Car = require("../models/car.model");
const Trip = require("../models/trip.model");
const Setting = require("../models/settings.model");
const Company = require("../models/company.model");
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

	const car = await Car.findById(trip.car._id);
	if (!car) {
		throw new ApiError(404, "car not found");
	}

	const owner = await Owner.findById(car.owner);
	if (!owner) {
		throw new ApiError(404, "owner not found");
	}

	const company = await Company.findById(trip.company);
	if (!company) {
		throw new ApiError(404, "owner not found");
	}
	const setting = await Setting.findOne();
	if (!setting) {
		throw new ApiError(404, "Setting Not Found");
	}

	const invId = generateInvoiceId(car.model);

	if (trip.status === "completed") {
		throw new ApiError(404, "Trip already completed");
	}

	if (trip.generated.includes(new Date().toISOString().split("T")[0])) {
		throw new ApiError(403, "Invoice already generated for this trip");
	}

	if (trip.start.km > end.km) {
		throw new ApiError(401, "end km must be greater than start km");
	}

	trip.end = {
		date: end.date || new Date(),
		km: end.km,
	};

	trip.months[trip.months.length - 1].endDate = end.date || new Date();
	trip.months[trip.months.length - 1].endKm = end.km;

	await trip.save();

	const dayqty = Math.ceil((trip.end.date - trip.start.date) / (1000 * 60 * 60 * 24)) + 1;
	const kmqty = Math.ceil(trip.end.km - trip.start.km);

	const dayAmount = Number(((dayqty - trip.months[trip.months.length - 1].offroad) * car.rate.date).toFixed(2));
	const kmAmount = Number((kmqty * trip.car.rate.km).toFixed(2));

	const total = dayAmount + kmAmount;
	const gstTotal = Number(((total * setting.gstValue) / 100).toFixed(2));
	const billTotal = Number((gstTotal + total).toFixed(2));

	const isInvoicePresent = await Invoice.findOne({ trip: trip._id });

	if (isInvoicePresent) {
		isTripPresent;
		isTripPresent.dayQty += dayQty;
		isTripPresent.kmQty += kmqty;
		isTripPresent.offroad += trip.months[trip.months.length - 1].offroad;
		isTripPresent.dayAmount += dayAmount;
		isTripPresent.kmAmount += kmAmount;
		isTripPresent.totalAmount += total;
		isTripPresent.gstAmount += gstTotal.toFixed(2);
		isTripPresent.billAmount += billTotal;

		isTripPresent.months.push({
			startDate: trip.start.date,
			endDate: end.date,
			startKm: trip.start.km,
			endKm: end.km,
			offroad: invoice.offroad,
			invoiceDate: end.date || new Date(),
			days: invoice.dayQty + invoice.offroad,
			rate: {
				date: invoice.dayRate,
				km: invoice.kmRate,
			},
			rent: car.rent,
			district: trip.district,
			frvCode: trip.frvCode,
			totalDays: invoice.dayQty,
			dayAmount: dayAmount,
			kmAmount: kmAmount,
			totalAmount: total,
			gstAmount: gstTotal.toFixed(2),
			billAmount: billTotal,
			car: car._id,
		});
		trip.generated.push(new Date().toISOString().split("T")[0]);

		if (status === false) {
			trip.status = "completed";
			trip.offroad = 0;
			car.trip.pull(trip._id);
		}
		await isTripPresent.save();
		await car.save();
		await trip.save();

		res.status(201).json(new ApiResponse(200, invoice, "Invoice generated successfully."));
	} else {
		const invoice = await Invoice.create({
			owner: owner._id,
			car: car._id,
			company: company._id,
			trip: trip._id,
			invoiceId: invId,
			model: car.model,
			dayQty: dayqty,
			kmQty: kmqty,
			dayRate: car.rate.date,
			kmRate: car.rate.km,
			dayAmount: dayAmount,
			kmAmount: kmAmount,
			totalAmount: total,
			gstAmount: gstTotal.toFixed(2),
			billAmount: billTotal,
			offroad: trip.months[trip.months.length - 1].offroad,
		});

		invoice.months.push({
			startDate: trip.start.date,
			endDate: end.date,
			startKm: trip.start.km,
			endKm: end.km,
			offroad: invoice.offroad,
			invoiceDate: end.date || new Date(),
			days: invoice.dayQty + invoice.offroad,
			rate: {
				date: invoice.dayRate,
				km: invoice.kmRate,
			},
			rent: car.rent,
			district: trip.district,
			frvCode: trip.frvCode,
			totalDays: invoice.dayQty,
			dayAmount: dayAmount,
			kmAmount: kmAmount,
			totalAmount: total,
			gstAmount: gstTotal.toFixed(2),
			billAmount: billTotal,
			car: car._id,
		});

		owner.invoices.push(invoice._id);
		await invoice.save();
		await owner.save();

		trip.generated.push(new Date().toISOString().split("T")[0]);

		if (status === false) {
			trip.status = "completed";
			trip.offroad = 0;
			car.trip.pull(trip._id);
		}
		await car.save();
		await trip.save();

		res.status(201).json(new ApiResponse(200, invoice, "Invoice generated successfully."));
	}
});

exports.getAllInvoices = catchAsyncErrors(async (req, res) => {
	const allInvoices = await Invoice.find().populate("owner company car  months.car");

	if (!allInvoices || allInvoices.length === 0) {
		throw new ApiError(404, "No invoices found in the database.");
	}
	// Create an empty array to store formatted invoices
	const formattedInvoices = [];

	allInvoices.forEach((invoice) => {
		formattedInvoices.push({
			_id: invoice?._id,
			invoiceId: invoice.invoiceId,
			company: invoice.company,
			owner: invoice.owner,
			model: invoice.model,
			months: invoice.months,
			car: invoice.car,
		});
	});
	res.status(200).json(new ApiResponse(200, formattedInvoices, "All invoices retrieved successfully."));
});

exports.getAllOwnerInvoices = catchAsyncErrors(async (req, res) => {
	const allInvoices = await Invoice.find().populate("owner company");

	if (!allInvoices || allInvoices.length === 0) {
		throw new ApiError(404, "No invoices found in the database.");
	}
	// Create an empty array to store formatted invoices
	const formattedInvoices = [];

	allInvoices.forEach((invoice) => {
		// console.log(invoice);
		// Check if the owner is already present in formattedInvoices
		const companyIndex = formattedInvoices.findIndex((companyInvoices) => {
			// console.log(companyInvoices.company);
			// console.log("invoice =", invoice.company);
			return companyInvoices.owner?._id.toString() === invoice?.owner?._id?.toString();
		});

		// If company is not present, then add the company along with the current invoice
		if (companyIndex === -1) {
			formattedInvoices.push({
				company: invoice.company,
				owner: invoice.owner,
				invoices: [
					{
						model: invoice.model,
						invoice: [
							{
								_id: invoice?._id,
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
			const modelIndex = formattedInvoices[companyIndex].invoices.findIndex((inv) => {
				return inv.model === invoice.model;
			});

			// If model is not present, add the model along with the current invoice
			if (modelIndex === -1) {
				formattedInvoices[companyIndex].invoices.push({
					model: invoice.model,
					invoice: [
						{
							_id: invoice?._id,
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
				formattedInvoices[companyIndex].invoices[modelIndex].invoice.push({
					_id: invoice?._id,
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

exports.getVendorsInvoices = catchAsyncErrors(async (req, res) => {
	const allInvoices = await Invoice.find().populate("owner company car trip");

	if (!allInvoices || allInvoices.length === 0) {
		throw new ApiError(404, "No invoices found in the database.");
	}

	res.status(200).json(new ApiResponse(200, allInvoices, "All invoices retrieved successfully."));
});

exports.payInvoices = catchAsyncErrors(async (req, res) => {
	const { invoiceId, month: invDate } = req.body;
	console.log("****************************");
	const invoice = await Invoice.findById(invoiceId).populate("owner");
	if (!invoice) {
		throw new ApiError(404, "invoice not found in the database.");
	}
	const invDateParsed = new Date(invDate);
	console.log(invoice.months[0].invoiceDate.toString() == invDateParsed.toString());

	for (const month of invoice.months) {
		if (month.invoiceDate.toString() == invDateParsed.toString()) {
			month.companyStatus = "paid";
		}
	}

	await invoice.save();

	res.status(200).json(new ApiResponse(200, invoice, "Payment Successful"));
});
// ?? pay all invoices
exports.payOwner = catchAsyncErrors(async (req, res) => {
	const { ownerId, transaction, invDate } = req.body;

	if (!ownerId || !transaction || !invDate) {
		throw new ApiError(400, "All fields are required.");
	}
	const invDateParsed = new Date(invDate);

	const result = await Invoice.updateMany(
		{
			owner: ownerId.toString(),
			"months.invoiceDate": invDateParsed,
		},
		{
			$set: { "months.$.ownerStatus": "paid" },
		}
	);

	if (result.nModified === 0) {
		throw new ApiError(404, "No matching invoices found or no updates made.");
	}
	res.status(200).json(new ApiResponse(200, {}, "Bill Payment added successfully"));
});

exports.getSingleInvoice = catchAsyncErrors(async (req, res) => {
	const { id } = req.query;
	const invoice = await Invoice.findById(id).populate("owner company car");

	if (!invoice) {
		throw new ApiError(404, "invoice not found in the database.");
	}

	res.status(200).json(new ApiResponse(200, invoice, "Invoice Payment Successful"));
});

exports.getIndividualInvoices = catchAsyncErrors(async (req, res) => {
	const allInvoices = await Invoice.find().populate("owner company trip car");

	if (!allInvoices || allInvoices.length === 0) {
		throw new ApiError(404, "No invoices found in the database.");
	}

	res.status(200).json(new ApiResponse(200, allInvoices, "All invoices retrieved successfully."));
});
