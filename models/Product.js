const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
     {
          name: {
               type: String,
               required: true,
          },
          image: { type: String, required: true },
          images: [String],
          seller: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true
          },
          brand: { type: String, required: true },
          price: { type: Number, default: 0, required: true },
          category: { type: String, required: true },
          countInStock: { type: Number, default: 0, required: true },
          description: { type: String, required: true },
          rating: { type: Number, default: 0, required: true },
          numReviews: { type: Number, default: 0, required: true },
          reviews: [{
               type: Schema.Types.ObjectId,
               ref: 'Review'
          }],
     },
     { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;