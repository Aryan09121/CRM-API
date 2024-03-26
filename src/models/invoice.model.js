const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: "Owner", // Reference to the Owner model
	},
	model: {
		type: String,
		required: true,
	},
	dayQty: {
		type: Number,
		required: true,
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
