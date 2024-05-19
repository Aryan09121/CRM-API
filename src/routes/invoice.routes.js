const { Router } = require("express");
const {
	generateInvoice,
	getAllInvoices,
	getIndividualInvoices,
	payInvoices,
	getSingleInvoice,
	getAllOwnerInvoices,
	payOwnerBill,
	getVendorsInvoices,
	payAllInvoices,
} = require("../controllers/invoice.controller");

const router = Router();

router.route("/generate/invoice").post(generateInvoice);
router.route("/get/invoices").get(getAllInvoices);
router.route("/get/owner/invoices").get(getAllOwnerInvoices);
router.route("/get/vendors/invoices").get(getVendorsInvoices);
router.route("/get/invoice").get(getSingleInvoice);
router.route("/pay/invoice").post(payInvoices);
router.route("/pay/all/invoice").post(payAllInvoices);
router.route("/pay/owner").post(payOwnerBill);
router.route("/get/individual/invoices").get(getIndividualInvoices);
// router.route("/trip/completed").post(markTripasCompleted);

module.exports = router;
