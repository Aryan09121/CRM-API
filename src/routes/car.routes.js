const { Router } = require("express");
const { authUser } = require("../middlewares/auth.middleware.js");

const { getCars, carMaintenance, getSingleCar } = require("../controllers/car.controller.js");

const router = Router();

router.route("/car").get(authUser, getCars);
router.route("/update/car/maintenance").get(authUser, carMaintenance);
router.route("/singlecar").get(authUser,getSingleCar);

module.exports = router;
