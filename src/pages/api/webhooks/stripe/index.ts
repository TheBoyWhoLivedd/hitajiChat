import Stripe from "stripe";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/app/models/user";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = await buffer(req);
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return res.status(400).json(`Webhook Error: ${error.message}`);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log(session?.metadata?.userId);

  if (event.type === "checkout.session.completed") {
    console.log("Payment Successful");
    const user = await User.findById(session?.metadata?.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const numOfCredits = Number(session?.metadata?.numOfCredits);

    if (isNaN(numOfCredits)) {
      return res.status(400).json({ msg: "Invalid number of credits" });
    }

    user.credits += numOfCredits;

    await user.save();
  }
  res.status(200).send({ received: true });
}
