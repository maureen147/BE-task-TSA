import mongoose from "mongoose";
const { Schema } = mongoose;

const propertySchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      enum: ["rent", "sale", "lease"],
      default: "sale",
    },
    location: {
      type: String,
      trim: true,
      required: true,
    },
    bedroom: {
      type: Number,
      default: 1,
    },
    bathroom: {
      type: Number,
      default: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    images: [{
      url: {
        type: String,
      },
      imagePublicId: {
        type: String,
      }
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
