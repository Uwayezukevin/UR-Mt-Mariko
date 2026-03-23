import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true, // This already creates an index - keep this
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
          type: String,
        },
      },
    ],
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

// REMOVE this line - it's causing the duplicate index
// reportSchema.index({ event: 1 });

// Keep this one - it's a different index
reportSchema.index({ publishedAt: -1 });

export default mongoose.model("Report", reportSchema);