const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const multer = require("multer");
const AppError = require("../utils/AppError");
const verifyToken = require("../middleware/verifyToken");
const asyncHandler = require("express-async-handler");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const filenName = `user~${Date.now()}.${ext}`;
    cb(null, filenName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];

  if (imageType === "image") return cb(null, true);
  else return cb(new AppError("The file must be an image", 400), false);
};

const upload = multer({ storage, fileFilter });

router.post(
  "/signup",
  upload.single("profilePhoto"),
  asyncHandler(userController.Signup)
);

router.post("/login", asyncHandler(userController.Login));

router.use("/account", verifyToken);

router
  .route("/account")
  .get(asyncHandler(userController.GetAccountData))
  .patch(
    upload.single("profilePhoto"),
    asyncHandler(userController.UpdateAccount)
  )
  .delete(asyncHandler(userController.DeleteAccount));

router.patch(
  "/account/update-password",
  asyncHandler(userController.ChangePassword)
);

router.post("/logout", verifyToken, asyncHandler(userController.Logout));

module.exports = router;
