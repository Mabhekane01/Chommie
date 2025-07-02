const express = require("express");
const router = express.Router();
const { login, refresh } = require("./authController");

router.post("/login", login); // assume OTP verified
router.post("/refresh", refresh);

module.exports = router;
