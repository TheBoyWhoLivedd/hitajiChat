import { User } from "@/app/models/user";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "POST") {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      await mongooseConnect();

      try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Please Login" });
  }
  res.end();
}
