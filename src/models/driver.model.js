const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

// user Schema
const driverSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			minLength: [6, "name should be atleast 6 character long"],
		},
		contact: {
			type: String,
			minLength: [10, "Contact should be atleast 10 character long"],
			maxLength: [10, "Contact must not be exceed 10 character long"],
		},
		gender: {
			type: String,
			// required: [true, "Gender is required"],
			enum: ["male", "female", "others"],
		},
		email: {
			type: String,
			unique: true,
			reqired: [true, "Email is required"],
			match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
		},
        // tripCompleted:{
        //     type: Number,
        //     default: 0,
        // },
        // totalKilomer:{
        //     type: Number,
        //     default: 0,
        // },
        accidentHistory:{
            type:Number,
            default:0,
        },
        status : {
            type: String,
            enum: ["available", "completed", "ongoing"],
            default: "available",
			// required: [true, "Status is required"],
        },
        cars: [
			{
				type: Schema.Types.ObjectId,
				ref: "Car",
			},
		],
        trips: [
			{
				type: Schema.Types.ObjectId,
				ref: "Trip",
			},
		],
	},
	{ timestamps: true }
);

const Driver = mongoose.model("driver", driverSchema);
module.exports = Driver;
