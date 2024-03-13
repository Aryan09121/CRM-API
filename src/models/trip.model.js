const mongoose = require("mongoose");

const { Schema } = mongoose;

// trip Schema
const tripSchema = new Schema(
	{
		car: {
			type: Schema.Types.ObjectId,
			ref: "Car",
		},
		driver: {
			type: Schema.Types.ObjectId,
			ref: "Driver",
		},

		startKm: {
			type: Number,
			required: true,
		},

		startDate: {
			type: Date,
			required: true,
		},

		endingKm: {
			type: Number,
		},

		endingDate: {
			type: Date,
		},

		tripStatus: {
			type: String,
			enum: ["ongoing", "completed"],
			default: "ongoing",
		},
	},
	{ timestamps: true }
);

const Trip = mongoose.model("trip", tripSchema);
module.exports = Trip;
