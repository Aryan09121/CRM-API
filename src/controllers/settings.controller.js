const { ApiError } = require("../utils/ApiError.js");
const Setting = require("../models/settings.model.js");
const Car = require("../models/car.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const { setting: setid } = require("../constants.js");
const MailSender = require("../utils/Nodemailer.js");

exports.updateGstValue = catchAsyncErrors(async (req, res) => {
	const { gstValue } = req.body;

	// const setting = await Setting.create({ gstValue });

	const setting = await Setting.findOneAndUpdate({ _id: setid }, { gstValue });

	res.status(200).json(new ApiResponse(200, setting, "Gst Value updated successfully"));
});

exports.getGstValue = catchAsyncErrors(async (req, res) => {
	const setting = await Setting.findById(setid);
	if (!setting) {
		throw new ApiError(404, "Setting Not Found");
	}

	res.status(200).json(new ApiResponse(200, setting.gstValue, "Gst Value updated successfully"));
});

exports.updateDayRate = catchAsyncErrors(async (req, res) => {
	const { rate, model } = req.body;

	const cars = await Car.find({ model });

	if (!cars && cars.length === 0) {
		throw new ApiError(404, "Car Not Found");
	}

	for (const car of cars) {
		car.rate.date = rate;
		await car.save();
	}

	res.status(200).json(new ApiResponse(200, {}, "Day Rate updated successfully"));
});

exports.sendPdf = catchAsyncErrors(async (req, res) => {
	const { email } = req.body;

	const mailSender = new MailSender(email, "Invoice", "Attached is your invoice.", "Bill details here");

	mailSender.send();

	res.status(200).json({ message: "Invoice sent successfully" });
});

exports.updateKmRate = catchAsyncErrors(async (req, res) => {
	const { rate, model } = req.body;

	const cars = await Car.find({ model });

	if (!cars && cars.length === 0) {
		throw new ApiError(404, "Car Not Found");
	}

	for (const car of cars) {
		car.rate.km = rate;
		await car.save();
	}

	res.status(200).json(new ApiResponse(200, {}, "Km rate updated successfully"));
});
