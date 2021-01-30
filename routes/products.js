const express = require('express');
const Product = require('../models/Product');
const router = express.Router();


//Get all products
router.get("/", (req, res, next) => {
     Product.find()
          .then(data => res.status(200).json(data))
          .catch(error => res.status(500).json({ message: error }))
});

//Get a specific product
router.get("/:idProd", (req, res, next) => {
     Product.findById(req.params.idProd)
          .then(data => res.status(200).json(data))
          .catch(error => res.status(500).json({ message: "Failure to find this product's id in database" }))
})

//Add a new product
router.post("/", (req, res, next) => {
     // console.log(req.body)
     Product.create(req.body)
          .then(data => res.status(200).json(data))
          .catch(error => res.status(500).json({ message: error }))
})


module.exports = router;