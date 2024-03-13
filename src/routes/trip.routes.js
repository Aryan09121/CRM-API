const {Router} = require("express");
const {getTrips} = require("../controllers/trip.controller");

const router = Router();

router.route("/add/trip").post(getTrips);

module.exports = router;