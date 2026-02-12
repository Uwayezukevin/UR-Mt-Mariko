import mongoose from "mongoose";

const sakramentSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export default mongoose.model("Amasakramentu", sakramentSchema);
