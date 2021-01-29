const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
     name: { type: String, required: true },
     email: {
          type: String,
          unique: true,
          required: true,
     },
     password: { type: String, required: true },
     isAdmin: { type: Boolean, required: true, default: false },
     isSeller: { type: Boolean, required: true, default: false },
     seller: {
          name: String,
          logo: String,
          description: String,
          rating: { type: Number, default: 0, required: true },
          numReviews: { type: Number, default: 0, required: true },
     },
},
     {
          timestamps: true
     }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
