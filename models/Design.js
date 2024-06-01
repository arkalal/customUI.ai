import mongoose, { Schema } from "mongoose";

const componentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  fill: { type: String, required: true },
  content: { type: String, default: "" },
});

const designSchema = new Schema({
  name: { type: String, required: true },
  components: { type: [componentSchema], required: true },
  styles: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Design = mongoose.models.Design || mongoose.model("Design", designSchema);

export default Design;
