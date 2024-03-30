const { Router } = require("express");
const { addTrip, markTripasCompleted } = require("../controllers/trip.controller");

const router = Router();

router.route("/add/trip").post(addTrip);

module.exports = router;
