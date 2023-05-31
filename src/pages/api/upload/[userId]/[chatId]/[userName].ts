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
import { Request} from "express";
import getRawBody from "raw-body";

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error("Pinecone environment or api key vars missing");
}

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

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "test-index";

interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}

// API route handler
export default async function handler(
  req: Request | NextApiRequestWithFile,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "POST") {
      await mongooseConnect();
      try {
        // Get the raw body of the request using getRawBody
        const rawBody = await getRawBody(req, { limit: "10mb" });

        // Convert the rawBody into JSON
        const body = JSON.parse(rawBody.toString());

        // Destructure pdfContent and originalFileName
        const { pdfContent, originalFileName } = body;
        // const { pdfContent, originalFileName } = req.body;
        const { userId, chatId, userName } = req.query;
        // const originalFileName = req.file?.originalname;
        const docTitle = originalFileName?.slice(0, -4);
        const content = `Hey ${userName}, I would be glad to answer any question about ${docTitle}, or if you would like me to give you a summary of what ${docTitle} is about, just click the Summarize button above`;
        const defaultMessage = {
          role: "assistant",
          content: content,
          _id: uuidv4(),
          starred: false,
        };
        const pineConeNameSpace = `${userId}-${chatId}`;
        // Read the contents of the PDF file
        const newDocument = new Documents({
          _id: pineConeNameSpace,
          name: docTitle,
          content: pdfContent,
          userId: userId,
        });

        // Save the new document to the database
        await newDocument.save();
        await Chat.findOneAndUpdate(
          { _id: chatId },
          { $push: { messages: defaultMessage } }
        );
        const myDocument =
          pdfContent && new Document({ pageContent: pdfContent });
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        const docs =
          myDocument && (await textSplitter.splitDocuments([myDocument]));
        res.status(200).json({
          status: "success",
          message: docTitle,
          content: defaultMessage,
        });
        const embeddings = new OpenAIEmbeddings();
        const pinecone = await initPinecone();
        const index = pinecone.Index(PINECONE_INDEX_NAME);
        // console.log(index); //change to your own index name

        //embed the PDF documents
        if (docs) {
          await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex: index,
            namespace: pineConeNameSpace,
            textKey: "text",
          });
        }

        // Add the new message to the messages array of the chat document

        // Send a response with the PDF contents
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Please Login" });
  }
  res.end();
}

// Disable Next.js body parser to allow multer to handle the file
export const config = {
  api: {
    bodyParser: false,
  },
};
