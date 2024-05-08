const { Router } = require("express");
const { addTrip, markTripasCompleted, getAllTrips } = require("../controllers/trip.controller");

const router = Router();

router.route("/add/trip").post(addTrip);
router.route("/get/trips").get(getAllTrips);

module.exports = router;
