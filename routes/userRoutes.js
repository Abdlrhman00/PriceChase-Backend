const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const multer = require("multer");
const AppError = require("../utils/AppError");
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");

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

router.post("/signup", upload.single("profilePhoto"), userController.Signup);

router.post('/login',userController.Login)

router.route('/account')
.get(verifyToken,userController.GetAccountData);
// .patch(UpdateAccount)
// .delete(DeleteAccount)

/*

router.psot('/logout',Logout)


*/
module.exports = router;
