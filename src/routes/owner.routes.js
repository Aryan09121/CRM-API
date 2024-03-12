const { Router } = require("express");
const { getOwnerById, addNewOwner, getOwners } = require("../controllers/owner.controller.js");
const { authUser } = require("../middlewares/auth.middleware.js");

const router = Router();

// ?? Admin Routes
router.route("/owner/:id").get(authUser, getOwnerById);
router.route("/owner").get(authUser, getOwners);
router.route("/add/owner").post(authUser, addNewOwner);

module.exports = router;
