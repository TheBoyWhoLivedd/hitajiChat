import { Schema, model, models } from "mongoose";

const USerSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
  emailVerified: { type: String },
  credits: {
    type: Number,
    default: 1, // or set to initial credits value
  },
});

export const User = models.User || model("User", USerSchema);
