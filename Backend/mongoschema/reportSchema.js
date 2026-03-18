import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true, // One report per event
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String, // For Cloudinary or other image hosting
        },
        caption: {
          type: String,
          default: "",
        },
      },
    ],
    summary: {
      type: String,
      default: "",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
reportSchema.index({ event: 1 });
reportSchema.index({ publishedAt: -1 });

export default mongoose.model("Report", reportSchema);