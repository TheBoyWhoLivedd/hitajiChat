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
});

export const User = models.User || model("User", USerSchema);
