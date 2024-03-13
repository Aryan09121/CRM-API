const { Router } = require("express");
const { addTrip, markTripasCompleted } = require("../controllers/trip.controller");

const router = Router();

router.route("/add/trip").post(addTrip);
router.route("/trip/completed").post(markTripasCompleted);

module.exports = router;
