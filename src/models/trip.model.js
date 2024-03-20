const mongoose = require("mongoose");

const { Schema } = mongoose;

// trip Schema
const tripSchema = new Schema(
	{
		car: {
			type: Schema.Types.ObjectId,
			ref: "Car",
		},
		start: {
			km: {
				type: Number,
				required: true,
			},
			date: {
				type: Date,
				required: true,
				default: Date.now(),
			},
		},
		end: {
			km: {
				type: Number,
			},
			date: {
				type: Date,
			},
		},
		route: {
			source: {
				type: String,
				required: true,
			},
			destination: {
				type: String,
				required: true,
			},
		},
		tripStatus: {
			type: String,
			enum: ["ongoing", "completed", "upcoming"],
			default: "ongoing",
		},
	},
	{ timestamps: true }
);

const Trip = mongoose.model("trip", tripSchema);
module.exports = Trip;
