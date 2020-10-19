const express = require("express");

const router = express.Router();

// include CLOUDINARY:

const uploader = require("../configs/cloudinary.config.js");

router.post("/upload", uploader.single("attachment"), (req, res, next) => {
  // console.log('file is: ', req.file)

  if (!req.file) {
    next(new Error("No file uploaded!"));

    return;
  }

  res.json({ image: req.file.secure_url });
});

module.exports = router;
