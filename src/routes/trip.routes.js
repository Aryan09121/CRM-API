const { Router } = require("express");
const { addTrip, updateOffroad, getAllTrips, completeTrip } = require("../controllers/trip.controller");
const { authUser } = require("../middlewares/auth.middleware.js");

const router = Router();

router.route("/add/trip").post(authUser, addTrip);
router.route("/complete/trip").post(authUser, completeTrip);
router.route("/update/offroad").post(authUser, updateOffroad);
router.route("/get/trips").get(authUser, getAllTrips);

module.exports = router;
