const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema({
	invoiceId: {
		type: String,
		unique: true,
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: "owner",
	},
	company: {
		type: Schema.Types.ObjectId,
		ref: "company", // Reference to the Company model
		unique: false, // Set to false to allow multiple trips for the same company
	},
	trip: {
		type: Schema.Types.ObjectId,
		ref: "Trip",
	},
	car: {
		type: Schema.Types.ObjectId,
		ref: "Car",
	},
	model: {
		type: String,
	},
	dayQty: {
		type: Number,
	},
	offroad: {
		type: Number,
		default: 0,
	},
	dayRate: {
		type: Number,
	},
	dayAmount: {
		type: Number,
	},
	kmQty: {
		type: Number,
	},
	kmRate: {
		type: Number,
	},
	kmAmount: {
		type: Number,
	},
	totalAmount: {
		type: Number,
	},
	gstAmount: {
		type: Number,
	},
	billAmount: {
		type: Number,
	},
	from: {
		type: Date,
	},
	fromkm: Number,
	tokm: Number,
	to: {
		type: Date,
	},
	invoiceDate: {
		type: Date,
		default: Date.now,
	},
	months: [
		{
			startDate: Date,
			endDate: Date,
			startKm: Number,
			endKm: Number,
			days: Number,
			offroad: Number,
			dayAmount: Number,
			kmAmount: Number,
			totalDays: Number,
			totalKm: Number,
			totalAmount: Number,
			gstAmount: Number,
			billAmount: Number,
			invoiceDate: Date,
			district: String,
			frvCode: String,
			car: {
				type: Schema.Types.ObjectId,
				ref: "Car",
			},
			rate: {
				date: Number,
				km: Number,
			},
			rent: Number,
			companyStatus: {
				type: String,
				enum: ["paid", "pending"],
				default: "pending",
			},
			ownerStatus: {
				type: String,
				enum: ["paid", "pending"],
				default: "pending",
			},
		},
	],
	status: {
		type: String,
		enum: ["paid", "pending", "unpaid"],
		default: "unpaid",
	},
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
