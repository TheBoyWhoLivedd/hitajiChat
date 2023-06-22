import { Schema, model, models } from "mongoose";
const CreditPackageSchema = new Schema({
  packageName: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  numOfCredits: {
    type: Number,
    required: true,
  },
});

export const CreditPackage =
  models.CreditPackage || model("CreditPackage", CreditPackageSchema);
