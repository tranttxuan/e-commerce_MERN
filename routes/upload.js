const express = require('express');
const router = express.Router();
const upload = require("../configs/cloudinary-setup");


router.post("/", upload.single("image"), (req, res) => {
  console.log("go here")
  console.log(req.file)
    res.send(`${req.file.path}`)
})



module.exports = router;