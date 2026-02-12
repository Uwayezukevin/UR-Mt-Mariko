import mongoose from "mongoose";

const subgroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export default mongoose.model("subgroups", subgroupSchema);
