const { ApiError } = require("../utils/ApiError.js");
const Owner = require("../models/owner.model");
const Car = require("../models/car.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.getCars = catchAsyncErrors(async (req, res) => {
	const cars = await Car.find();
	if (!cars) {
		throw new ApiError(404, "cars Not Found");
	}
	res.status(200).json(new ApiResponse(200, cars, "cars fetched successfully"));
});

exports.getSingleCar = catchAsyncErrors(async (req, res) => {
	// const car = await Car.findById(req?.query?.id);
	// const populatedCar = await car.populate("owner");
	const car = await Car.findOne({ _id: req.query.id }).populate();
	if (!car) {
		throw new ApiError(404, "Car Not Found");
	}
	// const ObjectId = car.owner.toString();
	// console.log(ObjectId);
	// const carOwner = await Owner.findById(ObjectId);
	// console.log(carOwner);
	res.status(200).json(new ApiResponse(200, car, "car fetched successfully"));
});

exports.carMaintenance = catchAsyncErrors(async (req, res) => {
	const car = await Car.findById(req.body.id);
	if (!car) {
		throw new ApiError(404, "car Not Found");
	}
	// ?? year month amount	
	const { year, month, amount } = req.body;
	car.maintenance.push({ year, month, amount });
	const updatedCar = await car.save();
	if (!updatedCar) {
		throw new ApiError(400, "Error while updating the car");
	}
	res.status(200).json(new ApiResponse(200, car, "car maintenance updated successfully"));
});
