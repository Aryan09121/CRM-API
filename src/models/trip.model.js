const mongoose = require("mongoose");

const { Schema } = mongoose;

// trip Schema
const tripSchema = new Schema(
	{
		cars: [
			{
				type: Schema.Types.ObjectId,
				ref: "Car",
			},
		],

		drivers: {
			type: Schema.Types.ObjectId,
			ref: "Driver",
		},

		startKm: {
			type: Number,
		},

		startDate: {
			type: Number,
		},

		endingKm: {
			type: Number,
		},

		endingDate: {
			type: Number,
		},

		tripStatus: {
			type: String,
			enum: ["available", "ongoing", "completed"],
			default: "avaliable",
		},
	},
	{ timestamps: true }
);

const Trip = mongoose.model("trip", tripSchema);
module.exports = Trip;