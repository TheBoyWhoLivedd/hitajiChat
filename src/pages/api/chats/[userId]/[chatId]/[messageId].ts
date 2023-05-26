import { NextApiRequest, NextApiResponse } from "next";
import { Chat } from "@/app/models/chat";
import { ChatProps } from "../../../../../../types";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../auth/[...nextauth]";
import { StarredMessage } from "@/app/models/starredMessage";

//Similar to our former createChat function.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    await mongooseConnect();
    if (req.method === "POST") {
      const { userId, chatId, messageId } = req.query;
      console.log("🚀 ~ file: [messageId].ts:19 ~ messageId:", messageId);
      console.log("🚀 ~ file: [messageId].ts:19 ~ chatId:", chatId);
      console.log("🚀 ~ file: [messageId].ts:19 ~ userId:", userId);
      const { starredProperty, title } = req.body;
      console.log(
        "🚀 ~ file: [messageId].ts:24 ~ starredProperty:",
        starredProperty
      );
      console.log("🚀 ~ file: [messageId].ts:24 ~ title:", title);

      if (typeof starredProperty !== "boolean") {
        return res.status(400).send({ message: "Starred must be a boolean" });
      }

      try {
        const chat: ChatProps | null = await Chat.findOneAndUpdate(
          { _id: chatId, "messages._id": messageId },
          { $set: { "messages.$[message].starred": starredProperty } },
          { arrayFilters: [{ "message._id": messageId }], new: true }
        );
        if (!chat) {
          return res.status(404).send({ message: "Chat not found" });
        }

        const message = chat.messages.find((message) => {
          // console.log("🚀 ~ file: chatController.js:338 ~ updateStarred ~ message:", message)
          return message._id == messageId;
        });
        if (!message) {
          return res.status(404).send({ message: "Message not found" });
        }

        if (starredProperty) {
          // If the message is starred, create a new object with the additional properties
          const starredMessage = {
            //@ts-ignore
            ...message.toObject(),
            chat_title: title,
            messageId: message._id,
            userId,
            chatId,
          };
          const starredMessageDoc = await StarredMessage.create(starredMessage);

          res.status(200).send({ success: true, starredMessage });
        } else {
          // If the message is not starred, remove it from the starred_messages array
          await StarredMessage.findOneAndDelete({ messageId: message._id });

          res.status(200).send({ success: true });
        }
      } catch (error: any) {
        return res.status(500).send({ success: false, error: error.message });
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
