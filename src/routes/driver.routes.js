const { Router } = require("express");
const { addDriver, updateAccidentHistory, getDrivers, getDriverById } = require("../controllers/driver.controller");

const router = Router();

router.route("/add/driver").post(addDriver);
router.route("/update/driver").patch(updateAccidentHistory);
router.route("/get/drivers").get(getDrivers);
router.route("/get/driver").get(getDriverById);

module.exports = router;
