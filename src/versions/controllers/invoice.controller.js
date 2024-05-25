const Invoice = require("../models/invoice.model.js");
const Car = require("../models/car.model");
const Trip = require("../models/trip.model");
const Setting = require("../models/settings.model");
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
		// console.log("hellow");
		throw new ApiError(403, "Invoice already generated for today");
	}
	if (trip.start.km > end.km) {
		throw new ApiError(401, "end km is not greater than start km");
	}

	trip.end = {
		date: end.date || new Date(),
		km: end.km,
	};

	await trip.save();
	const gst = await Setting.findOne();
	const dayqty = Math.ceil((trip.end.date - trip.start.date) / (1000 * 60 * 60 * 24)) + 1;
	const kmqty = Math.ceil(trip.end.km - trip.start.km);

	const dayAmount = (dayqty - trip.offroad) * trip.car.rate.date;
	const kmAmount = kmqty * trip.car.rate.km;

	const total = dayAmount + kmAmount;
	const gstTotal = (total * gst.gstValue) / 100;
	const billTotal = (gstTotal + total).toFixed(2);

	const invoiceId = generateInvoiceId(trip.car.model);

	const invoice = await Invoice.create({
		owner: trip.car.owner,
		company: trip.company,
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
	} else {
		owner.invoices.push(invoice._id);

		const inv = {
			start: invoice.from,
			end: invoice.to,
			car: invoice.car,
			rent: trip.car.rent,
			offroad: invoice.offroad,
			days: dayqty,
			amount: dayqty * trip.car.rent,
			invoiceDate: invoice.invoiceDate,
			_id: invoice._id,
		};

		// Check if bills array is empty
		if (owner.bills.length === 0) {
			owner.bills.push({ model: trip.car.model, invoices: [] });
		}

		let billFound = false;
		// Iterate through bills array
		for (let i = 0; i < owner.bills.length; i++) {
			if (owner.bills[i].model === invoice.model) {
				owner.bills[i].invoices.push(inv);
				billFound = true;
				break; // No need to continue the loop once the bill is found and updated
			}
		}

		// If bill with model not found, create a new one
		if (!billFound) {
			owner.bills.push({ model: trip.car.model, invoices: [inv] });
		}

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

exports.getAllInvoices = catchAsyncErrors(async (req, res) => {
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
			return companyInvoices.company?._id.toString() === invoice?.company?._id?.toString();
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
								car: invoice.car,
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
							car: invoice.car,
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
					car: invoice.car,
					from: invoice.from,
					to: invoice.to,
					status: invoice.status,
				});
			}
		}
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
	const { id } = req.query;
	const invoice = await Invoice.findById(id).populate("owner");

	if (!invoice) {
		throw new ApiError(404, "invoice not found in the database.");
	}

	invoice.status = "paid";
	await invoice.save();

	res.status(200).json(new ApiResponse(200, invoice, "Invoice Payment Successful"));
});
// ?? pay all invoices
exports.payAllInvoices = catchAsyncErrors(async (req, res) => {
	const { ids } = req.body; // Assuming the IDs are sent in the body as an array

	if (!Array.isArray(ids) || ids.length === 0) {
		throw new ApiError(400, "No invoice IDs provided or invalid format.");
	}

	const invoices = await Invoice.updateMany(
		{ _id: { $in: ids } },
		{ $set: { status: "paid" } },
		{ multi: true } // Ensure multiple documents are updated
	);

	if (invoices.nModified === 0) {
		throw new ApiError(404, "No invoices found or all invoices are already paid.");
	}

	res.status(200).json(new ApiResponse(200, {}, "Invoices Payment Successful"));
});

// ?? payOwnerBill
exports.payOwnerBill = catchAsyncErrors(async (req, res) => {
	const { transaction } = req.body;
	const { id } = req.query;
	const owner = await Owner.findById(id);

	if (!owner) {
		throw new ApiError(404, "Owner not found in the database.");
	}

	if (owner.bills.length === 0) {
		throw new ApiError(404, "No bills to pay.");
	}

	// let arr = [];
	// Loop through each bill and push it individually into the paid array
	// owner.bills.forEach((bill) => {
	// 	console.log(bill);
	// 	arr.push(bill);
	// });

	// console.log(arr);
	owner.paid.push({ transaction, bills: owner.bills });

	// Clear the bills array
	owner.bills = [];

	await owner.save();

	res.status(200).json(new ApiResponse(200, {}, "Owner Payment Successful"));
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
