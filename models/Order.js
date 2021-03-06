const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
     user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
     },
     orderItems: [
          {
               name: { type: String, required: true },
               quantity: { type: Number, required: true },
               image: { type: String, required: true },
               price: { type: String, required: true },
               product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
               },
               seller:{
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
               },
          },
     ],
     shippingAddress: {
          fullName: { type: String, required: true },
          address: { type: String, required: true },
          city: { type: String, required: true },
          postalCode: { type: String, required: true },
          country: { type: String, required: true },
          lat: Number,
          lng: Number,
     },
     paymentMethod: { type: String, required: true },
     paymentResult: {
          id: { type: String },
          status: { type: String },
          email_address: { type: String },
          client_secret:{type:String}
     },

     itemsPrice: { type: Number },
     taxPrice: { type: Number },
     shippingPrice: { type: Number },
     totalPrice: { type: Number },
     isPaid: { type: Boolean, default: false },
     paidAt: { type: Date },
     isDelivered: { type: Boolean, default: false },
     deliveredAt: { type: Date },
},
     {
          timestamps: true
     }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
