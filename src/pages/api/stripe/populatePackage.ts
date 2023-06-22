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
        price: process.env.SILVER,
        numOfCredits: 1000,
      },
      {
        packageName: "Gold",
        price: process.env.GOLD,
        numOfCredits: 10500,
      },
      {
        packageName: "Platinum",
        price: process.env.PLATINUM,
        numOfCredits: 22000,
      },
    ]);
  }

  res.status(200).json({ msg: "Successfully populated packages" });
}
