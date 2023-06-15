import { NextApiRequest, NextApiResponse } from "next";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { Document } from "langchain/document";
import { Documents } from "@/app/models/document";
import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../auth/[...nextauth]";
import { Chat } from "@/app/models/chat";
import { Request } from "express";
import getRawBody from "raw-body";

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error("Pinecone environment or api key vars missing");
}

// PineconeClient initialization
let pinecone: PineconeClient;

async function initPinecone() {
  if (!pinecone) {
    try {
      pinecone = new PineconeClient();
      await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT ?? "",
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });
    } catch (error) {
      console.error("error", error);
      throw new Error("Failed to initialize Pinecone Client");
    }
  }
  return pinecone;
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("Missing Pinecone index name in .env file");
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "test-index";

interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}

// API route handler
export default async function handler(
  req: Request | NextApiRequestWithFile,
  res: NextApiResponse
) {
  console.time("Embedding PDF Content");
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "POST") {
      try {
        await mongooseConnect();
        const rawBody = await getRawBody(req, { limit: "10mb" });
        const body = JSON.parse(rawBody.toString());
        const { pdfContent, originalFileName } = body;
        const { userId, chatId, userName } = req.query;
        const docTitle = originalFileName?.slice(0, -4);
        const content = `Hey ${userName}, I would be glad to answer any question about ${docTitle}, or if you would like me to give you a summary of what ${docTitle} is about, just click the Summarize button (S) above`;
        const defaultMessage = {
          role: "assistant",
          content: content,
          _id: uuidv4(),
          starred: false,
        };
        const pineConeNameSpace = `${userId}-${chatId}`;
        const newDocument = new Documents({
          _id: pineConeNameSpace,
          name: docTitle,
          content: pdfContent,
          userId: userId,
        });

        await newDocument.save();
        await Chat.findOneAndUpdate(
          { _id: chatId },
          { $push: { messages: defaultMessage } }
        );
        const myDocument =
          pdfContent && new Document({ pageContent: pdfContent });
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 8000,
          chunkOverlap: 200,
        });
        const docs =
          myDocument && (await textSplitter.splitDocuments([myDocument]));
        const embeddings = new OpenAIEmbeddings();
        const index = (await initPinecone()).Index(PINECONE_INDEX_NAME);

        //embed the PDF documents
        if (docs) {
          await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex: index,
            namespace: pineConeNameSpace,
            textKey: "text",
          });
        }

        res.status(200).json({
          status: "success",
          message: docTitle,
          content: defaultMessage,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      } finally {
        console.timeEnd("Embedding PDF Content");
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Please Login" });
  }
}

// Disable Next.js body parser to allow multer to handle the file
export const config = {
  api: {
    bodyParser: false,
  },
};
