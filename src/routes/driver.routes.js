const { Router } = require("express");
const { addDriver } = require("../controllers/driver.controller");

const router = Router();

router.route("/add/driver").post(addDriver);

module.exports = router;
