const { Router } = require("express");
const { authUser } = require("../middlewares/auth.middleware.js");
const { getCars } = require("../controllers/car.controller.js");

const router = Router();

router.route("/car").get(authUser, getCars);

module.exports = router;
