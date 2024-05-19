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
	const { email, invoices } = req.body;

	// Construct the HTML email body with invoice details
	let emailBody = `
		<h1>Bill Details 💵💸</h1>
		<p>Dear Customer,</p>
		<p>Attached is your Bill Details for the month of February 2024.</p>
		<p>Below are the invoice details:</p>
		<table border="1">
	   	 <thead>
		 	  <tr>
			 	 <th>Model</th>
			 	 <th>Count</th>
				  <th>Period From</th>
				  <th>Period To</th>
				  <th>Total Day Qty</th>
				  <th>Total Day Amount</th>
			   </tr>
	   	 </thead>
	    <tbody>
	 `;

	invoices.forEach((invoice) => {
		emailBody += `
	    <tr>
		   <td>${invoice.model}</td>
		   <td>${invoice.count}</td>
		   <td>${invoice.periodFrom}</td>
		   <td>${invoice.periodTo}</td>
		   <td>${invoice.totalDayQty}</td>
		   <td>${invoice.totalDayAmount}</td>
	    </tr>
	`;
	});

	emailBody += `
	    </tbody>
	</table>
 `;

	emailBody += `<p>Thank you for your business.</p>`;

	const mailSender = new MailSender(email, "Bill Details 💵💸", "Attached is your Bill Details For the month of Febuary 2024.", emailBody);

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
