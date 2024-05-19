const { ApiError } = require("../utils/ApiError.js");
const Owner = require("../models/owner.model");
const Car = require("../models/car.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.addCar = catchAsyncErrors(async (req, res) => {
	const data = req.body;

	console.log(data);

	res.status(200).json(new ApiResponse(200, {}, "cars fetched successfully"));
});

exports.getCars = catchAsyncErrors(async (req, res) => {
	const cars = await Car.find().populate("trip");
	if (!cars) {
		throw new ApiError(404, "cars Not Found");
	}
	res.status(200).json(new ApiResponse(200, cars, "cars fetched successfully"));
});

exports.getSingleCar = catchAsyncErrors(async (req, res) => {
	// const car = await Car.findById(req?.query?.id);
	// const populatedCar = await car.populate("owner");
	const car = await Car.findOne({ _id: req.query.id }).populate("owner trip");
	if (!car) {
		throw new ApiError(404, "Car Not Found");
	}
	// const ObjectId = car.owner.toString();
	// console.log(ObjectId);
	// const carOwner = await Owner.findById(ObjectId);
	// console.log(carOwner);
	res.status(200).json(new ApiResponse(200, car, "car fetched successfully"));
});

exports.getBrandCarBrandsByOwnerId = catchAsyncErrors(async (req, res) => {
	// console.log(req.body);
	const param = req.query.param;
	// console.log(param);
	// Check if the search parameter is provided
	if (!param) {
		throw new ApiError(400, "Missing search parameter");
	}

	const owner = await Owner.findOne({ $or: [{ contact: param }, { email: param }] }).populate("cars");

	// Check if owner exists
	if (!owner) {
		throw new ApiError(404, "Owner not found");
	}

	// Group cars by model name
	const groupedCars = owner.cars.reduce((acc, car) => {
		const modelName = car.model;
		if (!acc[modelName]) {
			acc[modelName] = [];
		}
		acc[modelName].push(car);
		return acc;
	}, {});

	res.status(200).json(new ApiResponse(200, { owner, cars: groupedCars }, "cars fetched successfully"));
});

exports.getCarsByownerId = catchAsyncErrors(async (req, res) => {
	const ownerId = req?.params?.id;
	// console.log(ownerId);
	const cars = await Car.find({ owner: ownerId });
	if (!cars || cars.length === 0) {
		throw new ApiError(404, "Cars Not Found");
	}
	res.status(200).json(new ApiResponse(200, cars, "cars fetched successfully"));
});

exports.editCarRate = catchAsyncErrors(async (req, res) => {
	const { day, km } = req.body;
	const car = await Car.findById(req.query.id);
	if (!car) {
		throw new ApiError(404, "car Not Found");
	}
	car.rate = {
		day: day,
		km: km,
	};

	await car.save();

	const updatedCar = await car.save();
	if (!updatedCar) {
		throw new ApiError(400, "Error while updating the car");
	}
	res.status(200).json(new ApiResponse(200, car, "car maintenance updated successfully"));
});
