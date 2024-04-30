const { Router } = require("express");
const { generateInvoices, generateInvoice, getAllInvoices, getIndividualInvoices } = require("../controllers/invoice.controller");

const router = Router();

router.route("/generate/invoices").post(generateInvoices);
router.route("/generate/invoice").post(generateInvoice);
router.route("/get/invoices").get(getAllInvoices);
router.route("/get/individual/invoices").get(getIndividualInvoices);
// router.route("/trip/completed").post(markTripasCompleted);

module.exports = router;
