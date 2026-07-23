const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "Product size is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image URL is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Personal", "Bulk", "Corporate"],
      default: "Personal",
    },
    stock: {
      type: Number,
      required: true,
      default: 50,
      min: [0, "Stock cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
