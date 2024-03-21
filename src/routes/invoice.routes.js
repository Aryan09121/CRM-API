const { Router } = require("express");
const { generateInvoice } = require("../controllers/invoice.controller");

const router = Router();

router.route("/generate/invoice").post(generateInvoice);
// router.route("/trip/completed").post(markTripasCompleted);

module.exports = router;
