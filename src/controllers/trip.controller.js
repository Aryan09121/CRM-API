const Trip = require("../models/trip.model");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");

exports.getTrips = catchAsyncErrors(async (req, res) => {
//   const { cars, drivers, currentKm, endingKm } = req.body;

   

    const trips = await Trip.find(filter);

    if (!trips || trips.length === 0) {
      throw new ApiError(404, "No trips found");
    }

    res.json(ApiResponse(trips));
  
});
