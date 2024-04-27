const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: "owner",
	},
	trip: {
		type: Schema.Types.ObjectId,
		ref: "trip",
	},
	car: {
		type: Schema.Types.ObjectId,
		ref: "car",
	},
	model: {
		type: String,
		required: true,
	},
	dayQty: {
		type: Number,
		required: true,
	},
	offroad: {
		type: Number,
		default: 0,
	},
	dayRate: {
		type: Number,
		required: true,
	},
	dayAmount: {
		type: Number,
		required: true,
	},
	kmQty: {
		type: Number,
		required: true,
	},
	kmRate: {
		type: Number,
		required: true,
	},
	kmAmount: {
		type: Number,
		required: true,
	},
	totalAmount: {
		type: Number,
		required: true,
	},
	invoiceDate: {
		type: Date,
		default: Date.now,
	},
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
