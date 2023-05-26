import { NextApiRequest, NextApiResponse } from "next";
import { Chat } from "@/app/models/chat";
import { ChatProps } from "../../../../../types";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { getServerSession } from "next-auth/next";
import authOptions from "../../auth/[...nextauth]";

//Similar to our former createChat function.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    await mongooseConnect();
    if (req.method === "POST") {
      try {
        const userId = req.query.userId as string;
        const newChat: ChatProps = {
          title: "new chat ",
          userId,
          messages: [],
          pinned: false,
          isTitleUpdated: false,
          isSummarized: false,
        };

        const chatDoc = await Chat.create(newChat);

        return res.status(201).json({
          success: true,
          message: "New chat created",
          chat: chatDoc,
        });
      } catch (err: any) {
        return res.status(500).json({
          success: false,
          message: "Error creating new chat",
          error: err.message,
        });
      }
    } else {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }
  } else {
    res.status(401).json({ success: false, message: "Please Login" });
  }
  res.end();
}
