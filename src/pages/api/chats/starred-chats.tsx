import { User } from "@/app/models/user";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]";
import { Chat } from "@/app/models/chat";
import { StarredMessage } from "@/app/models/starredMessage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "POST") {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User Id is required" });
      }
      await mongooseConnect();

      try {
        const starredMessages = await StarredMessage.find({ userId });

        if (!starredMessages) {
          return res.status(404).json({ error: "Starred Messages not found" });
        }

        res.status(200).json(starredMessages);
      } catch (error) {
        console.error("Error fetching Starred Messages:", error);
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
