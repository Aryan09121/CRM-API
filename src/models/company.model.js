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
			match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
		},
		address: {
			type: "string",
		},
		pan: {
			type: String,
			unique: [true, "pan no should be unique"],
			required: true,
		},
		gst: {
			type: String,
			unique: [true, "gst no should be unique"],
			required: true,
		},
		hsn: {
			type: String,
			unique: [true, "hsn no should be unique"],
			required: [true, "hsn Number should be required"],
		},
	},
	{ timestamps: true }
);

const Company = mongoose.model("company", companySchema);
module.exports = Company;
