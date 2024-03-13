const { Router } = require("express");

const router = Router();

router.router("/").post("Hello");

module.exports = router;
