const { Router } = require("express");
const {
	generateInvoices,
	generateInvoice,
	getAllInvoices,
	getIndividualInvoices,
	payInvoices,
	getSingleInvoice,
} = require("../controllers/invoice.controller");

const router = Router();

router.route("/generate/invoices").post(generateInvoices);
router.route("/generate/invoice").post(generateInvoice);
router.route("/get/invoices").get(getAllInvoices);
router.route("/get/invoice").get(getSingleInvoice);
router.route("/pay/invoice").post(payInvoices);
router.route("/get/individual/invoices").get(getIndividualInvoices);
// router.route("/trip/completed").post(markTripasCompleted);

module.exports = router;
