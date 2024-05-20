const mongoose = require("mongoose");

const { Schema } = mongoose;

// owner Schema
const ownerSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
		},
		contact: {
			type: String,
			unique: [true, "contact should be unique"],
			minLength: [10, "Contact should be atleast 10 character long"],
			maxLength: [10, "Contact must not be exceed 10 character long"],
		},
		gender: {
			type: String,
			required: [true, "Gender is required"],
			enum: ["male", "female", "others"],
		},
		email: {
			type: String,
			unique: [true, "email should be unique"],
			reqired: [true, "Email is required"],
			match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
		},
		address: {
			street: {
				type: String,
				required: [true, "Street is required"],
			},
			city: {
				type: String,
				required: [true, "City is required"],
			},
			state: {
				type: String,
				required: [true, "State is required"],
			},
			pincode: {
				type: String,
				required: [true, "Pincode is required"],
				minLength: [6, "Pincode should be  6 character long"],
				maxLength: [6, "Pincode should be  6 character long"],
			},
		},
		bills: [
			{
				model: String,
				invoices: [
					{
						start: Date,
						end: Date,
						days: Number,
						offroad: Number,
						car: {
							type: Schema.Types.ObjectId,
							ref: "Car",
						},
						rent: Number,
						amount: Number,
						totalAmount: Number,
					},
				],
			},
		],
		paid: [
			{
				bills: [
					{
						model: String,
						invoices: [
							{
								start: Date,
								end: Date,
								days: Number,
								offroad: Number,
								car: {
									type: Schema.Types.ObjectId,
									ref: "Car",
								},
								rent: Number,
								amount: Number,
								totalAmount: Number,
							},
						],
					},
				],
				transaction: String,
			},
		],
		invoices: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],
		socials: {
			facebook: String,
			twiiter: String,
			instagram: String,
		},
		pan: {
			type: String,
			unique: [true, "gst no should be unique"],
			required: true,
		},
		aadhar: {
			type: String,
			unique: [true, "aadhar no should be unique"],
		},
		hsn: {
			type: String,
			// unique: [true, "pan no should be unique"],
		},
		joinedDate: {
			type: Date,
			default: Date.now, // Set the default value to the current date and time
			get: function (value) {
				// Convert the date to the desired format: date/month/year
				return value.toLocaleDateString("en-GB");
			},
		},
		payment_status: {
			type: String,
			enum: ["ongoing", "paid", "cancel", "onprocess"],
		},
		avatar: {
			type: Object,
			default: {
				fileId: "",
				url: "https://cdn.vectorstock.com/i/1000x1000/62/59/default-avatar-photo-placeholder-profile-icon-vector-21666259.webp",
			},
		},
		cars: [
			{
				type: Schema.Types.ObjectId,
				ref: "Car",
			},
		],
		status: {
			type: String,
			enum: ["paid", "unpaid"],
			default: "unpaid",
		},
	},
	{ timestamps: true }
);

const Owner = mongoose.model("owner", ownerSchema);
module.exports = Owner;
