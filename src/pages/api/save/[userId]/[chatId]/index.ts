// if req.method === POST Save chats to DB
// if req.method === DELETE deleteChat
// if req.method === PATCH updateChatTitle
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { NextApiRequest, NextApiResponse } from "next";
import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { withMethods } from "@/utils/withMethods";
import { User } from "@/app/models/user";
import { Documents } from "@/app/models/document";
import { Chat } from "@/app/models/chat";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../auth/[...nextauth]";
import { ChatProps, IUser } from "../../../../../../types.js";
import { getTokens } from "@/utils/util";

//Pinecone setup
async function initPinecone() {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? "", //this is in the dashboard
      apiKey: process.env.PINECONE_API_KEY ?? "",
    });

    return pinecone;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}
if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("Missing Pinecone index name in .env file");
}
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "";
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE ?? "trial-three"; //namespace is optional for your vectors

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("Missing Pinecone index name in .env file");
}

const fetchChatByChatId = async (chatId: string) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  return chat;
};
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    await mongooseConnect();
    if (req.method === "POST") {
      try {
        // console.log("🚀 ~ file: [chatId].ts:16 ~ req.body", req.body);
        const { messageToRedux, fullResponse, isSummary } = req.body;
        const { userId, chatId } = req.query;
        const _id = `${userId}-${chatId}`;
        const chat = await fetchChatByChatId(chatId as string);

        // Fetch the user
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }

        const promptTokens = getTokens(messageToRedux.content);
        const responseTokens = getTokens(fullResponse);

        const promptCredits = Math.ceil(promptTokens / 1000);
        const responseCredits = Math.ceil(responseTokens / 1000);

        if (user.credits < promptCredits + responseCredits) {
          user.credits = 0;
        } else {
          user.credits -= promptCredits + responseCredits;
        }

        await user.save();

        messageToRedux && chat.messages.push(messageToRedux);
        const lastMessage = {
          role: "assistant",
          content: fullResponse,
          _id: uuidv4(),
          starred: false,
        };
        chat.messages.push(lastMessage);
        if (isSummary && !chat.isSummarized) {
          chat.isSummarized = true;
        }
        await chat.save();
        await Documents.findOneAndDelete({ _id: _id });
        res.status(200).send({ lastMessage, credits: user.credits });
        console.log(
          "🚀 SUCCESS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        );
      } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    }
    if (req.method === "PATCH") {
      const { title } = req.body;

      if (!title) {
        return res.status(400).send({ message: "Title is required" });
      }

      try {
        const chat = await Chat.findById(req.query.chatId);
        if (!chat) {
          return res.status(404).send({ message: "Chat not found" });
        }
        chat.title = title;
        if (!chat.isTitleUpdated) {
          chat.isTitleUpdated = true;
        }
        await chat.save(); // save the changes to the database
        res.status(200).send({ message: "Title changed" });
      } catch (error: any) {
        res.status(500).send({ message: error.message });
      }
    }

    if (req.method === "DELETE") {
      const userId = req.query.userId as string;
      const chatId = req.query.chatId as string;
      const pinecone = await initPinecone();

      const index = pinecone.Index(PINECONE_INDEX_NAME);
      const namespace = `${userId}-${chatId}`;
      const userIdObj = new mongoose.Types.ObjectId(userId);
      const chatIdObj = new mongoose.Types.ObjectId(chatId);

      try {
        await Chat.findOneAndDelete({ _id: chatId });
        try {
          await Documents.findOneAndDelete({ _id: namespace });
        } catch (error: any) {
          if (error.name === "CastError") {
            console.error("Invalid ObjectID provided:", error);
          } else if (error.name === "DocumentNotFoundError") {
          } else {
          }
        }
        await index.delete1({
          deleteAll: true,
          namespace,
        });
        res.status(200).send({
          message: "Chat deleted successfully",
        });
      } catch (error: any) {
        res.status(500).send({ error: error.message });
      }
    }
  } else {
    res.status(401).json({ success: false, message: "Please Login" });
    res.end();
  }
}

export default withMethods(["GET", "POST", "DELETE", "PATCH"], handler);
