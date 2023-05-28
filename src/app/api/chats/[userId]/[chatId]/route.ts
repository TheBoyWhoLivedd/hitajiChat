// if req.method === POST addMessage function
// if req.method === DELETE deleteChat
// if req.method === PATCH updateChatTitle
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { PineconeClient } from "@pinecone-database/pinecone";
// import { NextApiRequest, NextApiResponse } from "next";
// import { ChatProps, IUser, VectorResult } from "../../../../../../types.js";
import type {
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
} from "openai";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import { getTokens } from "@/utils/util";
import { parse } from "url";

// export const runtime = "edge";
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

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("Missing Pinecone index name in .env file");
}
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "hitaji-chat";
// const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE ?? "trial-three"; //namespace is optional for your vectors

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

  const prompt = `You are a research assistant. Your name is Hitaji Research Assistant. When asked a question, your job is to sieve through the information,(Information: ${combinedText}) which has the highest cosine-similarity to the related question and use it to answer the question, question:${latestMessage}. If the question isn't related to the information, ask the person to rephrase the question.`;
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

const requestGPT3Turbo = async (
  messages: ChatCompletionRequestMessage[],
  userId: string,
  chatId: string,
  latestMessageId: string
) => {
  // const chat = await fetchChatByChatId(chatId);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let counter = 0;

  const chatRequestOpts: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.9,
    stream: true,
  };

  const chatResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(chatRequestOpts),
    }
  );

  if (!chatResponse.ok) {
    const err = await chatResponse.json();
    throw new Error(err.message);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const aiResponse: string[] = [];

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const { data } = event;

          if (data === "[DONE]") {
            // const userRequest = messages[messages.length - 1];
            // chat.messages.push({
            //   role: userRequest.role,
            //   content: userRequest.content,
            //   _id: latestMessageId,
            //   starred: false,
            // });

            // chat.messages.push({
            //   role: "assistant",
            //   content: aiResponse.join(" "),
            //   _id: uuidv4(),
            //   starred: false,
            // });

            // chat.save();
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content || "";
            aiResponse.push(text);

            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      if (chatResponse.body) {
        try {
          for await (const chunk of chatResponse.body as any) {
            const decodedChunk = decoder.decode(chunk);
            // console.log("Decoded chunk: ", decodedChunk);
            parser.feed(decodedChunk);
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
  });

  return stream;
};

export async function POST(req: Request): Promise<Response> {
  const { messages } = await req.json();
  console.log("This is the URL", req.url);
  // const session = await getServerSession(req, res, authOptions);
  // if (session) {
  try {
    const url = parse(req.url, true); // Parse the URL, including the query

    if (!url.pathname) {
      throw new Error("Pathname is missing in the request URL.");
    }
    const pathParts = url.pathname?.split("/"); // Split the pathname into parts

    // If there are five parts, then the third and fourth parts are the userId and chatId

    const userId = pathParts[3];
    const chatId = pathParts[4];

    console.log(`User ID: ${userId}, Chat ID: ${chatId}`);

    console.log("🚀 ~ file: index.ts:252 ~ handler ~ userId:", userId);
    console.log("🚀 ~ file: index.ts:252 ~ handler ~ chatId:", chatId);

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
      const sanitizedText = match.metadata?.text?.trim().replaceAll("\n", " ");
      combinedText += sanitizedText + "\n\n"; // concatenate with a space
    }
    const prompt = constructPrompt(combinedText, latestMessage, reqMessages);
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

    const messageStream = await requestGPT3Turbo(
      gptMessages,
      userId as string,
      chatId as string,
      latestMessageId
    );

    return new Response(messageStream);
  } catch (error: any) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  } finally {
    console.timeEnd("fetchEmbeddings");
    console.timeEnd("queryPinecone");
  }
}
