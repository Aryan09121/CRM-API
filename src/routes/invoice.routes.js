const { Router } = require("express");
const { generateInvoices, generateInvoice, getAllInvoices } = require("../controllers/invoice.controller");

const router = Router();

router.route("/generate/invoices").post(generateInvoices);
router.route("/generate/invoice").post(generateInvoice);
router.route("/get/invoices").get(getAllInvoices);
// router.route("/trip/completed").post(markTripasCompleted);

module.exports = router;
