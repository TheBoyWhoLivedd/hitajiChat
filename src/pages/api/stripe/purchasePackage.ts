// /api/purchasePackage.ts

import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { CreditPackage } from "@/app/models/creditPackage";
import { User } from "@/app/models/user";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]";
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

interface UserSession {
  user: {
    name: string;
    email: string;
    image: string;
  };
  expires: string;
}

const billingUrl = absoluteUrl("/dashboard");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = (await getServerSession(
    req,
    res,
    authOptions
  )) as UserSession;
  // console.log(session.user.email);
  if (!session) {
    return new Response(null, { status: 403 });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "Method not allowed" });
  }

  const { packageName } = req.body; // paymentInfo should include necessary details for Stripe

  try {
    await mongooseConnect();
    const user = await User.findOne({ email: session.user.email });
    console.log(user._id);
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
    // Fetch the package from the database
    const creditPackage = await CreditPackage.findOne({
      packageName: packageName,
    });
    if (!creditPackage) {
      return res.status(404).json({ msg: "Package not found" });
    }
    // Process the payment with Stripe
    try {
      // Create Checkout Sessions from body params.
      const stripeSession = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: creditPackage.price,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user._id.toString(),
          numOfCredits: creditPackage.numOfCredits,
        },
        mode: "payment",
        success_url: billingUrl,
        cancel_url: billingUrl,
      });
      return res.status(200).json({ url: stripeSession.url });
    } catch (err: any) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } catch (error: any) {
    console.error("An error occurred:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}
