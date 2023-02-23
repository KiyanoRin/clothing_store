const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.split("/")[1] === "jpeg" ||
    file.mimetype.split("/")[1] === "png" ||
    file.minetype.split("/")[1] === "jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("dmm"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = upload;
