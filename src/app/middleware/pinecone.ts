import { NextApiRequest, NextApiResponse } from "next";
import { PineconeClient } from "@pinecone-database/pinecone";
import { NextHandler } from "next-connect";
import { ExtendedNextApiRequest } from "../../../types";



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

export default async function pineconeMiddleware(
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  try {
    const pinecone = await initPinecone();
    req.pinecone = pinecone;
    req.indexName = process.env.PINECONE_INDEX_NAME ?? "";
    return next();
  } catch (error) {
    console.error("Pinecone middleware error:", error);
    return res
      .status(500)
      .json({ error: "Failed to initialize Pinecone Client" });
  }
}