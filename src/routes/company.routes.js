const { Router } = require("express");
const { authUser } = require("../middlewares/auth.middleware.js");
const { addNewCompany, getAllCompanies, addNewCompanies } = require("../controllers/company.controller.js");

const router = Router();

// ?? Admin Routes
router.route("/add/company").post(authUser, addNewCompany);
router.route("/add/companies").post(authUser, addNewCompanies);
router.route("/get/companies").get(authUser, getAllCompanies);

module.exports = router;
