//Summarize Document
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { ChatProps, IUser, Message } from "../../../../../types";
import { User } from "@/app/models/user";
import { Documents } from "@/app/models/document";
import { Chat } from "@/app/models/chat";
import { mongooseConnect } from "@/utils/mongooseConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await mongooseConnect();
  const UserId = req.query.userId as string;
  console.log("🚀 ~ file: [chatId].ts:16 ~ UserId:", UserId);
  const ChatId = req.query.chatId as string;
  console.log("🚀 ~ file: [chatId].ts:18 ~ ChatId:", ChatId);
  const _id = `${UserId}-${ChatId}`;
  const document = await Documents.findOne({ _id: _id });
  const content = document?.content;
  console.log("🚀 ~ file: [chatId].ts:20 ~ content:", document);
  const partitions = [];
  for (let i = 0; i < content!.length; i += 10000) {
    partitions.push(content?.substring(i, i + 10000));
  }
  let allSummaries = "";

  for (const partition of partitions) {
    let prompt = `You are a text summarizer. write a concise summary of the following text of not more than 90 words make sure you do not exceed that number,(text: ${partition}).`;
    let messages: Message[] = [{ role: "system", content: prompt }];
    let chatRequestOpts = {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.0,
    };
    let chatResponse = await fetch(
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
    let chatResponseBody = await chatResponse.json();
    let aiResponse = chatResponseBody.choices[0].message;
    allSummaries += aiResponse.content + "\n\n";
  }

  let prompt = `You are a text summarizer. write a detailed summary of the following text,(text: ${allSummaries}).`;
  let messages: Message[] = [{ role: "system", content: prompt }];
  let chatRequestOpts = {
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.0,
  };
  let chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(chatRequestOpts),
  });
  let chatResponseBody = await chatResponse.json();
  let aiResponse = chatResponseBody.choices[0].message;
  let finalSummary =
    "Here is the summary of the document:\n\n" + aiResponse.content;
  const summaryMessage: Message = {
    role: "assistant",
    content: finalSummary,
    _id: uuidv4(),
    starred: false,
  };
  res.status(200).json({
    status: "success",
    message: "Document summarized.",
    summary: summaryMessage,
  });
  const chat = await Chat.findOne({ _id: ChatId });
  chat.messages.push(summaryMessage);
  if (!chat.isSummarized) {
    chat.isSummarized = true;
  }
  await chat.save(); // save the updated user document
  await Documents.findOneAndDelete({ _id: _id });
  // console.log(finalSummary);
}
