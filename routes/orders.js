const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const Order = require('../models/Order');
const router = express.Router();

router.post("/", requireAuth, (req, res, next) => {
    req.body.user = req.session.currentUser;

    if (req.body.orderItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }
    Order.create(req.body)
        .then(data => res.status(200).json(data))
        .catch(err => {
            console.log(err)
            res.status(400).json({ message: err })
        })
})

router.get("/:id", requireAuth, (req, res, next) => {
    Order.findById(req.params.id)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(400).json({message:"Order not found"}))
})

module.exports = router;