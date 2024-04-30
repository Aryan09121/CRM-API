const mongoose = require("mongoose");
const { Schema } = mongoose;

const carSchema = new Schema(
	{
		registrationNo: {
			type: String,
			required: true,
		},
		model: {
			type: String,
			required: true,
		},
		totalkm: { type: Number, default: 0 },
		trip: [{ type: String, ref: "Trip" }],
		brand: {
			type: String,
			required: true,
		},
		features: {
			capacity: {
				type: Number,
				min: 1,
			},
			type: {
				type: String,
				enum: ["AC", "NON-AC"],
			},
			maxSpeed: {
				type: Number,
			},
		},
		rate: {
			date: {
				type: Number,
				min: 0,
			},
			km: {
				type: Number,
				min: 0,
			},
		},
		amount: {
			type: Number,
			default: 0,
		},
		dayAmount: {
			type: Number,
			default: 0,
		},
		kmAmount: {
			type: Number,
			default: 0,
		},
		amountpaid: {
			type: Number,
			default: 200,
		},
		start: {
			date: {
				type: Date,
				min: 0,
			},
			km: {
				type: Number,
				min: 0,
			},
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "owner", // Reference to the Owner model
		},
	},
	{ timestamps: true }
);

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
