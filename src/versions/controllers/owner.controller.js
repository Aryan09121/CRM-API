const { ApiError } = require("../utils/ApiError.js");
const Owner = require("../models/owner.model");
const Car = require("../models/car.model.js");
// const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const multer = require("multer");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const path = require("path");
// const imagekit = require("../utils/imagekit.js").initImageKit();

// ?? Add New Owner Handler
exports.addNewOwner = catchAsyncErrors(async (req, res) => {
	const { name, avatar, phone: contact, gender, email, address, aadhar, pan, joinedDate, account, ifsc } = req.body;
	const carsData = req.body.cars; // Extract cars data from request body

	if ([name, email, contact, gender, pan].some((field) => field === "")) {
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
		aadhar,
		gender,
		email,
		avatar,
		address,
		pan,
		account,
		ifsc,
		joinedDate: joinedDate || Date.now(),
	});

	// Create an array to store created car documents

	// Fetch the owner document along with the populated cars
	const populatedOwner = await Owner.findById(owner._id).populate("cars");

	if (!populatedOwner) {
		throw new ApiError(500, "Something went wrong while Adding the Owner");
	}

	return res.status(200).json(new ApiResponse(200, populatedOwner, "Owner Added Successfully"));
});

// ?? Get Single Owner Handler
exports.getOwnerById = catchAsyncErrors(async (req, res) => {
	// TODO: req.params.id is giving undefined. need to solve the issue by asking sir
	const owner = await Owner.findById(req.query.id).populate("cars invoices");
	if (!owner) {
		throw new ApiError(400, "Owner Details not Found");
	}

	return res.status(200).json(new ApiResponse(200, owner, "Owner Details Fetched Successfully"));
});

exports.updateRate = catchAsyncErrors(async (req, res) => {
	const { day } = req.body;
	const car = await Car.findById(req.query.id);
	if (!car) {
		throw new ApiError(400, "Car not Found");
	}

	if (day) {
		car.rent = day;
	}

	await car.save();

	return res.status(200).json(new ApiResponse(200, {}, "Car rent updated Successfully"));
});

// ?? Get All Owner Handler
exports.getOwners = catchAsyncErrors(async (req, res) => {
	// TODO: req.params.id is giving undefined . need to solve the issue by asking sir
	const owners = await Owner.find().populate("invoices");
	if (!owners) {
		throw new ApiError(400, "Owners not Found");
	}
	return res.status(200).json(new ApiResponse(200, owners, "Owner Details Fetched Successfully"));
});

// ?? update owner
exports.updateOwnerDetails = catchAsyncErrors(async (req, res) => {
	const { name, email, contact, gender, address, socials } = req.body;

	const owner = await Owner.findById(req?.query?.id);
	// console.log(!owner);
	if (!owner) {
		throw new ApiError(401, "Owner already exists");
	}

	if (name) {
		owner.name = name;
	}
	if (email) {
		owner.email = email;
	}
	if (contact) {
		owner.contact = contact;
	}
	if (gender) {
		owner.gender = gender;
	}
	if (address) {
		owner.address = address;
	}
	if (socials) {
		owner.socials = socials;
	}

	const updatedOwner = await owner.save();

	// const updatedOwner = await Owner.findByIdAndUpdate(owner._id, {
	// 	name,
	// 	email,
	// 	contact,
	// 	gender,
	// 	address,
	// 	socials,
	// });

	if (!updatedOwner) {
		throw new Error(401, "There was some Error while Updating the owner");
	}

	res.status(201).json(new ApiResponse(201, updatedOwner, "Owner updated successfully"));
});

// ?? Post Owners Avatar
// exports.onwerAvatar = catchAsyncErrors(async (req, res, next) => {
// 	try {
// 		console.log(req)
// 		const modifiedFileName = `resumebuilder=${Date.now}${path.extname(req.file.name)}`;
// 		const result = await imagekit.upload({
// 			file: req.file.path, // path to the uploaded file
// 			fileName: modifiedFileName, // original file name
// 		});
// 		res.status(200).json({ success: true, message: "Profile Updated", });
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).send('Error uploading image to ImageKit');
// 	}
// 	// const file = req.files.avatar;
// 	// const file = req.body.avatar

// 	// if (student.avatar.fileId !== "") {
// 	//     await imagekit.deleteFile(student.avatar.fileId)
// 	// }

// 	// const { fileId, url } = await imagekit.upload({
// 	//     file: file.data, fileName: modifiedFileName,
// 	// })

// 	// student.avatar = { fileId, url };
// 	// await student.save()
// 	// res.status(200).json({
// 	//     success: true,
// 	//     message: "Profile Updated",
// 	// });
// })

exports.onwerAvatar = catchAsyncErrors(async (req, res, next) => {
	try {
		// console.log(req?.file);

		// Ensure req.file exists and has the necessary information
		if (!req.file) {
			return res.status(400).json({ success: false, message: "No file uploaded" });
		}

		// Generate a modified filename
		const modifiedFileName = `resumebuilder-${Date.now()}${path.extname(req.file.originalname)}`;
		// Upload the file to ImageKit

		const result = await imagekit.upload({
			file: req.file.path, // path to the uploaded file
			fileName: modifiedFileName, // modified file name
			// transformation: [{
			// 	post: {
			// 		height: 300, // height of the transformed image
			// 		width: 300, // width of the transformed image
			// 		quality: 90 // quality of the transformed image (0 to 100)
			// 		// additional post-upload transformation parameters can be added here
			// 	},
			// 	pre: {
			// 		height: 300, // height of the transformed image
			// 		width: 300, // width of the transformed image
			// 		quality: 90 // quality of the transformed image (0 to 100)
			// 		// additional post-upload transformation parameters can be added here
			// 	}
			// }],
		});

		// Respond with success message
		res.status(200).json({ success: true, message: "Profile Updated", url: result.url });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: "Error uploading image to ImageKit" });
	}
});
