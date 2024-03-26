const mongoose = require("mongoose");
const { Schema } = mongoose;

const tripSchema = new Schema(
	{
		car: {
			type: Schema.Types.ObjectId,
			ref: "Car", // Reference to the Car model
		},
		district: {
			type: String,
			required: true,
		},
		year: {
			type: Number,
			required: true,
		},
		frvCode: {
			type: String,
			required: true,
		},
		start: {
			date: {
				type: Date,
				required: true,
			},
			km: {
				type: Number,
				required: true,
			},
		},
		end: {
			date: {
				type: Date,
			},
			km: {
				type: Number,
			},
		},
		invoiceGenerated: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
