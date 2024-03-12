const { ApiError } = require("../utils/ApiError.js");
const Owner = require("../models/owner.model");
const Car = require("../models/car.model.js");
// const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
// const path = require("path");
// const imagekit = require("../utils/imagekit.js").initImageKit();

// ?? Add New Owner Handler
// exports.addNewOwner = catchAsyncErrors(async (req, res) => {
// 	const { name, contact, gender, email, address, hsn, pan, joinedDate } = req.body;
// 	const cars = req.body.cars;

// 	if ([name, email, contact, gender, hsn, pan].some((field) => field?.trim() === "")) {
// 		throw new ApiError(400, "All fields are required");
// 	}

// 	const isOwnerExists = await Owner.findOne({ name, email, contact });
// 	if (isOwnerExists) {
// 		throw new ApiError(409, "User with given credentials already exists");
// 	}

// 	const owner = await Owner.create({
// 		name,
// 		contact,
// 		gender,
// 		email,
// 		address,
// 		hsn,
// 		pan,
// 		joinedDate: joinedDate || Date.now(),
// 		cars: cars ? cars : [],
// 	});

// 	const createdOwner = await Owner.findById(owner._id);

// 	cars.map(async (car) => {
// 		const { registrationNo, brand, model, frvcode, features, rate } = car;
// 		const { capacity, type } = features;
// 		const { km, date } = rate;
// 		console.log(cars);
// 		if ({ registrationNo, brand, model, frvcode, capacity, type, km, date }.some((field) => field.toString()?.trim() === "")) {
// 			throw new ApiError(400, "All fields are required");
// 		}

// 		const isCarsCreated = await Car.create({
// 			registrationNo,
// 			brand,
// 			model,
// 			frvcode,
// 			capacity,
// 			type,
// 			km,
// 			date,
// 			owner: createdOwner._id,
// 		});
// 		console.log(isCarsCreated);
// 		if (!isCarsCreated) {
// 			throw new ApiError(500, "Something went wrong while registering the car");
// 		}
// 	});

// 	if (!createdOwner) {
// 		throw new ApiError(500, "Something went wrong while Adding the Owner");
// 	}

// 	return res.status(200).json(new ApiResponse(200, createdOwner, "Owner Added Successfully"));
// });

exports.addNewOwner = catchAsyncErrors(async (req, res) => {
	const { name, contact, gender, email, address, hsn, pan, joinedDate } = req.body;
	const carsData = req.body.cars; // Extract cars data from request body

	if ([name, email, contact, gender, hsn, pan].some((field) => field?.trim() === "")) {
		throw new ApiError(400, "All fields are required");
	}

	const isOwnerExists = await Owner.findOne({ name, email, contact });
	if (isOwnerExists) {
		throw new ApiError(409, "User with given credentials already exists");
	}

	// Create the owner without cars
	const owner = await Owner.create({
		name,
		contact,
		gender,
		email,
		address,
		hsn,
		pan,
		joinedDate: joinedDate || Date.now(),
	});

	// Create an array to store created car documents
	const createdCars = [];

	// Loop through each car data and create the car associated with the owner
	for (const carData of carsData) {
		// Create the car without owner reference
		const singlecar = await Car.create({
			...carData,
		});
		if (!singlecar) {
			throw new ApiError(500, "Something went wrong while registering the car");
		}
		owner.cars.push(singlecar._id);
		await owner.save();
		// Update the created car to include a reference to the owner
		singlecar.owner = owner._id;
		await singlecar.save(); // Save the updated car
		createdCars.push(singlecar);
	}

	// Fetch the owner document along with the populated cars
	const populatedOwner = await Owner.findById(owner._id).populate("cars");

	if (!populatedOwner) {
		throw new ApiError(500, "Something went wrong while Adding the Owner");
	}

	return res.status(200).json(new ApiResponse(200, populatedOwner, "Owner Added Successfully"));
});

// ?? Get Single Owner MiddleWares
exports.getOwnerById = catchAsyncErrors(async (req, res) => {
	// TODO: req.params.id is giving undefined . need to solve the issue by asking sir
	const owner = await Owner.findById(req.query.id);
	console.log(req.query.id);
	if (!owner) {
		throw new ApiError(400, "Owner Details not Found");
	}
	return res.status(200).json(new ApiResponse(200, owner, "Owner Details Fetched Successfully"));
});

// ?? Get All Owner MiddleWares
exports.getOwners = catchAsyncErrors(async (req, res) => {
	// TODO: req.params.id is giving undefined . need to solve the issue by asking sir
	const owners = await Owner.find();
	console.log(req.query.id);
	if (!owners) {
		throw new ApiError(400, "Owners not Found");
	}
	return res.status(200).json(new ApiResponse(200, owners, "Owner Details Fetched Successfully"));
});

// ?? Get Owners Avatar
// exports.onwerAvatar = catchAsyncErrors(async (req, res, next) => {
//     const owner = await Owner.findById(req.params.id).exec();
//     const file = req.files.avatar;
//     const modifiedFileName = `resumebuilder=${Date.now}${path.extname(file.name)}`;

//     if (student.avatar.fileId !== "") {
//         await imagekit.deleteFile(student.avatar.fileId)
//     }

//     const { fileId, url } = await imagekit.upload({
//         file: file.data, fileName: modifiedFileName,
//     })

//     student.avatar = { fileId, url };
//     await student.save()
//     res.status(200).json({
//         success: true,
//         message: "Profile Updated",
//     });
// })
