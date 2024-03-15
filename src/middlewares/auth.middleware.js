const { ApiError } = require("../utils/ApiError.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

exports.authUser = catchAsyncErrors(async (req, res, next) => {
	try {
		let token = null;

		// Check if token is present in cookies
		if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		} else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			// Extract token from Authorization header
			token = req.headers.authorization.split(" ")[1];
		}

		// console.log(token);

		if (!token) {
			throw new ApiError(401, "Unauthorized request");
		}

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

		// console.log(decodedToken);

		const user = await User.findById(decodedToken?._id).select("-password");
		// console.log(user);
		if (!user) {
			throw new ApiError(401, "Invalid Access Token");
		}

		req.user = user;
		next();
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid access token");
	}
});
