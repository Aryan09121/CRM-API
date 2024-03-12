const { Router } = require("express");
const { getOwnerById, addNewOwner } = require("../controllers/owner.controller.js");
const { authUser } = require("../middlewares/auth.middleware.js");

const router = Router();

// ?? Admin Routes
router.route("/owner").post(authUser, getOwnerById);
router.route("/add/owner").post(authUser, addNewOwner);

module.exports = router;
