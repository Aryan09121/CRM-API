const mongoose = require("mongoose");
const { Schema } = mongoose;

const carSchema = new Schema(
	{
		registrationNo: {
			type: String,
			required: true,
			unique: [true, "Car Registration Number Should be Unique"],
		},
		model: {
			type: String,
			required: true,
		},
		year: { type: Number, default: new Date().getFullYear() },
		totalkm: { type: Number, default: 0 },
		totalDays: { type: Number, default: 0 },
		offroad: { type: Number, default: 0 },
		trip: [{ type: String, ref: "Trip" }],
		brand: {
			type: String,
			required: true,
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
		rent: {
			type: Number,
		},
		amount: {
			type: Number,
			default: 0,
		},
		ownerAmount: {
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
			default: 0,
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
