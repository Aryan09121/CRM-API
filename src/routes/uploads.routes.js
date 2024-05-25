const { Router } = require("express");
const { authUser } = require("../middlewares/auth.middleware.js");
const { addCars, handleTripsInvoices, addMultipleOwner } = require("../controllers/uploads.controller.js");

const router = Router();

router.route("/upload/cars").post(authUser, addCars);
router.route("/uploads/owners").post(authUser, addMultipleOwner);
router.route("/uploads/trips/invoices").post(authUser, handleTripsInvoices);

module.exports = router;
