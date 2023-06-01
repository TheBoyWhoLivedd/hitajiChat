import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { PineconeClient } from "@pinecone-database/pinecone";
import { NextApiRequest, NextApiResponse } from "next";
// import { ChatProps, IUser, VectorResult } from "../../../../../../types.js";
import type {
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
} from "openai";
import { getTokens } from "@/utils/util";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../auth/[...nextauth]";
import { withMethods } from "@/utils/withMethods";

// Global Pinecone instance
let pinecone: PineconeClient;

// Pinecone initialization
async function initPinecone() {
  if (!pinecone) {
    try {
      pinecone = new PineconeClient();

      await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT ?? "", //this is in the dashboard
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });
    } catch (error) {
      console.log("error", error);
      throw new Error("Failed to initialize Pinecone Client");
    }
  }

  return pinecone;
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "hitaji-chat";

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("Missing Pinecone index name in .env file");
}

// const fetchChatByChatId = async (chatId: string) => {
//   const chat = await Chat.findById(chatId);
//   if (!chat) {
//     throw new Error("Chat not found");
//   }
//   return chat;
// };

const processMessages = (messages: any[]): ChatCompletionRequestMessage[] => {
  return messages.map((message) => {
    const { _id, starred, ...rest } = message;
    return rest;
  });
};

const fetchEmbeddings = async (message: string) => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: message,
    }),
  });
  const responseData = await response.json();
  // console.log("embeddings" + responseData.data[0].embedding);
  return responseData.data[0].embedding;
};

const queryPinecone = async (
  embedding: number[],
  pineConeNameSpace: string
) => {
  const pinecone = await initPinecone();

  const index = pinecone.Index(PINECONE_INDEX_NAME);
  const queryRequest = {
    vector: embedding,
    topK: 4,
    includeValues: true,
    includeMetadata: true,
    namespace: pineConeNameSpace,
  };
  return await index.query({ queryRequest });
};

const constructPrompt = (
  combinedText: string,
  latestMessage: string,
  reqMessages: any[]
) => {
  let tokenCount = 0;
  reqMessages.forEach((msg) => {
    const tokens = getTokens(msg.content);
    tokenCount += tokens;
  });

  const prompt = `You are a research assistant. Your name is Hitaji Research Assistant. When asked a question, your job is to sieve through the information,(Information: ${combinedText}) which has the highest cosine-similarity to the related question and use it to answer the question below. If the question isn't related to the information, ask for clarity. ALWAYS REPLY IN MARKDOWN. question:${latestMessage}.`;
  tokenCount += getTokens(prompt);

  while (tokenCount >= 4000 && reqMessages.length > 0) {
    const firstMessage = reqMessages.shift();
    tokenCount -= getTokens(firstMessage.content);
  }

  if (tokenCount >= 4000) {
    throw new Error("Query too large");
  }

  return prompt;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  console.log(session);
  if (session) {
    if (req.method === "POST") {
      try {
        const {
          data: { messages },
        } = req.body;

        const { userId, chatId } = req.query;
        const pineConeNameSpace = `${userId}-${chatId}`;
        const reqMessages = processMessages(messages);
        const latestMessage = reqMessages[reqMessages.length - 1].content;
        const latestMessageId = messages[messages.length - 1]._id;
        console.time("fetchEmbeddings");
        const embedding = await fetchEmbeddings(latestMessage);
        console.timeEnd("fetchEmbeddings");
        console.time("queryPinecone");
        const queryResponse = await queryPinecone(embedding, pineConeNameSpace);
        console.timeEnd("queryPinecone");

        let combinedText = "";
        //@ts-ignore
        for (const match of queryResponse?.matches) {
          //@ts-ignore
          const sanitizedText = match.metadata?.text
            ?.trim()
            .replaceAll("\n", " ");
          combinedText += sanitizedText + "\n\n"; // concatenate with a space
        }
        const prompt = constructPrompt(
          combinedText,
          latestMessage,
          reqMessages
        );
        let tokenCount = 0;

        reqMessages.forEach((msg) => {
          const tokens = getTokens(msg.content);
          tokenCount += tokens;
        });
        tokenCount += getTokens(prompt);
        while (tokenCount >= 4000 && reqMessages.length > 0) {
          const firstMessage = reqMessages.shift();
          if (firstMessage) {
            tokenCount -= getTokens(firstMessage.content);
            console.log(
              `Removed message with ${getTokens(firstMessage.content)} tokens`
            );
          }
        }

        if (tokenCount >= 4000) {
          throw new Error("Query too large");
        }

        const gptMessages: ChatCompletionRequestMessage[] = [
          { role: "system", content: prompt },
          ...reqMessages,
        ];

        res.status(200).send({ gptMessages });
      } catch (error: any) {
        console.log(error);
        res.status(500).send({ message: error.message });
      } finally {
        console.timeEnd("fetchEmbeddings");
        console.timeEnd("queryPinecone");
      }
    }
  }
}

export default withMethods(["GET", "POST", "DELETE", "PATCH"], handler);
