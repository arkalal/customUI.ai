import mongoose, { Schema } from "mongoose";

const componentSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true, default: 100 }, // Default width
  height: { type: Number, required: true, default: 100 }, // Default height
  fill: { type: String, required: true },
  radius: { type: Number }, // only for circles
  points: { type: [Number] }, // only for lines
  text: { type: String }, // only for text
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
