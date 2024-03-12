const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/ApiError.js");
const Owner = require("../models/owner.model");
const Car = require("../models/car.model.js");
// const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

// ?? Add New Owner Handler
exports.addNewOwner = catchAsyncErrors(async (req, res) => {
	const { name, contact, gender, email, address, hsn, pan, joinedDate, cars } = req.body;

	if ([name, email, contact, gender, hsn, pan].some((field) => field?.trim() === "")) {
		throw new ApiError(400, "All fields are required");
	}

	const isOwnerExists = await Owner.findOne({ name, email, contact });
	console.log(isOwnerExists);
	if (isOwnerExists) {
		throw new ApiError(409, "User with email or username already exists");
	}

	const owner = await Owner.create({
		name,
		contact,
		gender,
		email,
		address,
		hsn,
		pan,
		joinedDate: joinedDate || Date.now(),
		cars: cars ? cars : [],
	});

	const createdOwner = await Owner.findById(owner._id);

	if (!createdOwner) {
		throw new ApiError(500, "Something went wrong while Adding the Owner");
	}

	return res.status(200).json(new ApiResponse(200, createdOwner, "Owner Added Successfully"));
});

// ?? Get Owner Details MiddleWares
exports.getOwnerById = catchAsyncErrors(async (req, res) => {
	const owner = await Owner.findById(req.params.id);
	if (owner) {
		throw new ApiError(400, "Owner Details not Found");
	}
});
