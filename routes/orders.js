const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const Order = require('../models/Order');
const User = require("../models/User");
const router = express.Router();
const Stripe = require('stripe');
const requireSeller = require('../middlewares/requireSeller');
const requireAdmin = require('../middlewares/requireAdmin');
const Product = require('../models/Product');

const stripe = new Stripe(process.env.STRIPE_KEY)

//get order list of customer 
router.get("/mine", requireAuth, (req, res, next) => {
    // console.log("check", req.session.currentUser)
    Order.find({ user: req.session.currentUser })
        .then(data => res.status(200).json(data))
        .catch(err => res.status(400).json({ message: err }))
})

//get order list that seller received
router.get("/seller", requireSeller, (req, res, next) => {
    Order.find({ "orderItems.seller": req.session.currentUser })
        .populate("user", "name")
        .then(data => res.status(200).json(data))
        .catch(err => res.status(400).json({ message: err }))
})

//get summary
router.get("/summary", requireAdmin, requireAdmin, async (req, res, next) => {
    try {
     
        const orders = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    numOrders: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' }
                }
            }
        ]);

        const users = await User.aggregate([
            {
                $group: {
                    _id: null,
                    numUsers: { $sum: 1 }
                }
            }
        ])

        const dailyOrders = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    sales: { $sum: '$totalPrice' }
                }
            }
        ])

        const productCategories = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ])

        res.status(200).json({ orders, users, dailyOrders, productCategories })
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err })
    }
})

//get details of a specific order
router.get("/:id", requireAuth, (req, res, next) => {
    Order.findById(req.params.id)
        .then(data => res.status(200).json(data))
        .catch(err => res.status(400).json({ message: "Order not found" }))
})


//create a new order
router.post("/", requireAuth, (req, res, next) => {
    req.body.user = req.session.currentUser;
    console.log(req.body)
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

//payment
router.post("/charge/stripe", requireAuth, (req, res, next) => {
    const { id, amount } = req.body;
    stripe.paymentIntents.create({
        amount,
        currency: "EUR",
        payment_method: id,
        confirm: true
    })
        .then(data => {
            console.log("response from stripe", data)
            res.status(200).json(data)
        })
        .catch(err => {
            console.log("response from stripe", err.message)
            { res.status(400).json({ message: err.message }) }
        })
})

//delete command
router.delete("/:idOrder", requireSeller, (req, res, next) => {
    Order.findByIdAndDelete(req.params.idOrder)
        .then(result => res.status(200).json(result))
        .catch(err => res.status(400).json({ message: "Failure to delete this order" }))
})

router.patch("/:id/pay", requireAuth, (req, res, next) => {
    Order.findById(req.params.id)
        .then(order => {
            console.log(order)
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = req.body;
            console.log("check payment result", req.body)
            Order.findByIdAndUpdate(req.params.id, order, { new: true })
                .then(result => res.status(200).json({ message: "Order paid" }))
                .catch(err => res.status(400).json({ message: "Order not paid" }))
        })
        .catch(err => res.status(400).json({ message: "Order not found" }))
})



module.exports = router;