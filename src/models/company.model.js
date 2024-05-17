const mongoose = require("mongoose");

const { Schema } = mongoose;

// owner Schema
const companySchema = new Schema(
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
		pan: {
			type: String,
			unique: [true, "gst no should be unique"],
			required: true,
		},
		gst: {
			type: String,
			unique: [true, "gst no should be unique"],
		},
		hsn: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Company = mongoose.model("company", companySchema);
module.exports = Company;
