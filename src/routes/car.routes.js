const { Router } = require("express");
const { authUser } = require("../middlewares/auth.middleware.js");

const { getCars, carMaintenance, getSingleCar, getCarsByownerId } = require("../controllers/car.controller.js");

const router = Router();

router.route("/car").get(authUser, getCars);
router.route("/update/car/maintenance").get(authUser, carMaintenance);
router.route("/singlecar").get(authUser, getSingleCar);
router.route("/get/cars/:id").get(authUser, getCarsByownerId);

module.exports = router;
