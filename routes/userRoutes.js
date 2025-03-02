const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const optionalAuth = require("../middleware/optionalAuth");
const validateRequiredFields = require("../middleware/validateRequiredFields");
const asyncHandler = require("express-async-handler");


router.post(
  "/signup",
  validateRequiredFields("user"),
  asyncHandler(userController.signup)
);

router.post("/login",optionalAuth, asyncHandler(userController.login));

router.use("/account", verifyToken);

router
  .route("/account")
  .get(asyncHandler(userController.getAccountData))
  .patch(
    asyncHandler(userController.updateAccount)
  )
  .delete(asyncHandler(userController.deleteAccount));

router.patch(
  "/account/update-password",
  asyncHandler(userController.changePassword)
);

router.post("/logout", verifyToken, asyncHandler(userController.logout));

module.exports = router;
