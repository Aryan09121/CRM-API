const { Router } = require("express");
const { authUser } = require("../middlewares/auth.middleware.js");
const { updateGstValue, getGstValue, updateDayRate, updateKmRate, sendPdf } = require("../controllers/settings.controller.js");

const router = Router();

router.route("/update/gst").post(authUser, updateGstValue);
router.route("/send/pdf").post(authUser, sendPdf);
router.route("/update/car/dayrate").post(authUser, updateDayRate);
router.route("/update/car/kmrate").post(authUser, updateKmRate);
router.route("/get/gst").get(authUser, getGstValue);

module.exports = router;
