const mongoose = require("mongoose");
const { Schema } = mongoose;

const tripSchema = new Schema(
	{
		car: {
			type: Schema.Types.ObjectId,
			ref: "Car", // Reference to the Car model
			unique: false, // Set to false to allow multiple trips for the same car
		},
		tripId: {
			type: String,
			unique: true, // Ensure uniqueness of tripId across all trips
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
		offroad: {
			type: Number,
			default: 0,
		},
		offroad_date: [
			{
				type: Date,
			},
		],
		end: {
			date: {
				type: Date,
			},
			km: {
				type: Number,
			},
		},
		generated: [
			{
				type: String,
			},
		],
		status: {
			type: String,
			enum: ["ongoing", "completed"], // Define possible values for status
			default: "ongoing", // Set default status as "ongoing"
		},
	},
	{ timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
