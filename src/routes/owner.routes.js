const { Router } = require("express");
const {
	getOwnerById,
	addNewOwner,
	getOwners,
	updateOwner,
	onwerAvatar,
	updateOwnerDetails,
	updateRate,
} = require("../controllers/owner.controller.js");
const { authUser } = require("../middlewares/auth.middleware.js");
const multer = require("multer");
const { ApiError } = require("../utils/ApiError.js");

const router = Router();

const fileFilter = (req, file, cb) => {
	// Define the allowed MIME types
	const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

	// Check if the uploaded file's MIME type is allowed
	if (allowedMimeTypes.includes(file.mimetype)) {
		// Accept the file
		cb(null, true);
	} else {
		// Reject the file
		cb(new ApiError("Invalid file type. Only JPEG, PNG, and GIF files are allowed."));
	}
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, __dirname + "../../../public/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });

// ?? Admin Routes
router.route("/owners").get(authUser, getOwners);
router.route("/owner").get(authUser, getOwnerById);
router.route("/add/owner").post(authUser, addNewOwner);
router.route("/update/owner").post(authUser, updateOwner);
router.route("/owner/edit/rate").post(authUser, updateRate);
// router.route("/add/owner/avatar").Upload.single('avatar').post(authUser, onwerAvatar);
router.post("/add/owner/avatar", upload.single("avatar"), authUser, onwerAvatar);

router.route("/update/owner").patch(authUser, updateOwnerDetails);

module.exports = router;
