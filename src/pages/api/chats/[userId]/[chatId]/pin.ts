//update Pinned
import { Chat } from "@/app/models/chat";
import { User } from "@/app/models/user";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export default async function updatePinned(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, chatId } = req.query as { userId: string; chatId: string };
  const { pinned } = req.body;

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const chatIdObj = new mongoose.Types.ObjectId(chatId);

  if (typeof pinned !== "boolean") {
    return res.status(400).json({ message: "Pinned must be a boolean" });
  }

  try {
    await Chat.findOneAndUpdate(
      { _id: chatIdObj, userId: userIdObj },
      { $set: { pinned: pinned } }
    );
    res.status(200).json("Pinned Message Successfully");
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
