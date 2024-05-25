const { ApiError } = require("../utils/ApiError.js");
const Company = require("../models/company.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

// ?? Add New Company Handler
exports.addNewCompany = catchAsyncErrors(async (req, res) => {
	const { name, phone: contact, email, address, gst, pan, hsn } = req.body;

	if ([name, email, contact, pan, gst, hsn].some((field) => field === "")) {
		throw new ApiError(400, "All fields are required");
	}

	const isCompanyExist = await Company.findOne({ email, contact, gst, hsn });
	if (isCompanyExist) {
		throw new ApiError(409, "Company with given credentials already exists");
	}

	// Create the company
	const company = await Company.create({
		name,
		contact,
		email,
		gst,
		hsn,
		pan,
		address,
	});

	if (!company) {
		throw new ApiError(500, "Something went wrong while Adding the Company Details");
	}

	return res.status(200).json(new ApiResponse(200, company, "Company Details Added Successfully"));
});

// ?? Add New Companies Handler
exports.addNewCompanies = catchAsyncErrors(async (req, res) => {
	const companies = req.body;

	if (companies.length === 0) {
		throw new ApiError(400, "Companies list are required");
	}

	for (const company of companies) {
		const { name, gst, hsn, pan, phone, address } = company;

		const isCompanyExist = await Company.findOne({ gst, hsn });
		if (isCompanyExist) {
			throw new ApiError(409, "Company with given credentials already exists");
		}

		// Create the company
		const companyCreated = await Company.create({
			name,
			contact: phone,
			gst,
			hsn,
			pan,
			address,
		});

		if (!companyCreated) {
			throw new ApiError(500, "Something went wrong while Adding the Company Details");
		}
	}

	return res.status(200).json(new ApiResponse(200, {}, "Company Details Added Successfully"));
});

// ?? Add New Company Handler
exports.getAllCompanies = catchAsyncErrors(async (req, res) => {
	const companies = await Company.find();

	if (!companies || companies.length === 0) {
		throw new ApiError(500, "Companies not found");
	}

	return res.status(200).json(new ApiResponse(200, companies, "Companies Fetched Successfully"));
});
