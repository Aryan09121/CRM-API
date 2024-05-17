const { Router } = require("express");
const { loginAdmin, registerUser, logoutUser, myProfile } = require("../controllers/user.controller.js");
const { authUser } = require("../middlewares/auth.middleware.js");
// const { upload } = require("../middlewares/multer.middleware.js");
// const { verifyJWT } = require("../middlewares/auth.middleware.js");

const router = Router();

// !! public routes --------------------------------
router.route("/login").post(loginAdmin);

// !! secured routes --------------------------------
router.route("/register").post(registerUser);
router.route("/me").get(authUser, myProfile);
router.route("/logout").post(authUser, logoutUser);

module.exports = router;
