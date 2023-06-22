import { CreditPackage } from "@/app/models/creditPackage";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "Method not allowed" });
  }

  const existingPackages = await CreditPackage.find({});

  if (existingPackages.length === 0) {
    await CreditPackage.create([
      {
        packageName: "Silver",
        price: "price_1NLMtRDhEN95Y6l92uWKXlUb", // Price in dollars or your currency
        numOfCredits: 100,
      },
      {
        packageName: "Gold",
        price: "price_1NLMuKDhEN95Y6l9kG4Ij8DU",
        numOfCredits: 500,
      },
      {
        packageName: "Platinum",
        price: "price_1NLMuoDhEN95Y6l93vygi9aY",
        numOfCredits: 1000,
      },
    ]);
  }

  res.status(200).json({ msg: "Successfully populated packages" });
}
