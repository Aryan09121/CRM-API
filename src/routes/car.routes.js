const { Router } = require("express");
const { authUser } = require("../middlewares/auth.middleware.js");

const { getCars, carMaintenance, getSingleCar, getCarsByownerId, getBrandCarBrandsByOwnerId } = require("../controllers/car.controller.js");

const router = Router();

router.route("/cars").get(authUser, getCars);
router.route("/update/car/maintenance").get(authUser, carMaintenance);
router.route("/singlecar").get(authUser, getSingleCar);
router.route("/get/cars/:id").get(authUser, getCarsByownerId);
router.route("/get/car/brand").get(authUser, getBrandCarBrandsByOwnerId);

module.exports = router;
