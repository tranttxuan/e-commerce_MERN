const express = require('express');
const Product = require('../models/Product');
const router = express.Router();


//Get all products
router.get("/", (req, res, next) => {
     //query parameters from frontend
     console.log("go here")
     const name = req.query.name || '';
     const category = req.query.category || '';
     const min = req.query.min && Number(req.query.min) !== 0 ? Number(req.query.min) : 0;
     const max = req.query.max && Number(req.query.max) !== 0 ? Number(req.query.max) : 0;
     const rating = req.query.rating && Number(req.query.rating) !== 0 ? Number(req.query.rating) : 0;

     //create query to search
     const categoryFilter = category ? { category } : {};
     const priceFilter = min && max ? { price: { $gte: Number(min), $lte: Number(max) } } : {};
     const ratingFilter = rating ? { rating: { $gt: rating } } : {};
     //Case insensitivity to match upper and lower cases
     const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {};
     const order = req.query.order
          ? req.query.order === 'lowest'
               ? { price: 1 }
               : req.query.order === "highest" ? { price: -1 }
                    : req.query.order === "newest" ? { _id: -1 }
                         : { rating: -1 }
          : { _id: -1 }
     console.log("check>>>>", priceFilter)

     Product.find({ ...categoryFilter, ...priceFilter, ...ratingFilter, ...nameFilter, ...ratingFilter })
          .sort(order)
          .then(data => {
               console.log(data)
               res.status(200).json(data)
          })
          .catch(error => res.status(500).json({ message: error }))
});

//Get list of categories
router.get("/categories", (req, res, next) => {
     Product.find().distinct("category")
          .then(data => res.status(200).json(data))
          .catch(error =>
               res.status(500).json({
                    message: "Failure to fetch data"
               }))
});

//Get a specific product
router.get("/:idProd", (req, res, next) => {
     Product.findById(req.params.idProd)
          .then(data => res.status(200).json(data))
          .catch(error =>
               res.status(500).json({
                    message: "Failure to find this product's id in database"
               }))
})




//Add a new product
router.post("/", (req, res, next) => {
     // console.log(req.body)
     Product.create(req.body)
          .then(data => res.status(200).json(data))
          .catch(error => res.status(500).json({ message: error }))
})


module.exports = router;