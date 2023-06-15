import { NextApiRequest, NextApiResponse } from "next";
import { Documents } from "@/app/models/document";
import { mongooseConnect } from "@/utils/mongooseConnect";
import { getTokens } from "@/utils/util";

const fetchSummary = async (partition: string) => {
  const prompt = `You are a text summarizer. write a concise summary of the following text,(text: ${partition}).`;
  const messages = [{ role: "system", content: prompt }];
  const chatRequestOpts = {
    model: "gpt-3.5-turbo-16k",
    messages,
    temperature: 0.0,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(chatRequestOpts),
  });

  const responseBody = await response.json();
  const { content } = responseBody.choices[0].message;

  return content;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  console.time("Handler Execution Time");
  try {
    await mongooseConnect();

    const { userId: UserId, chatId: ChatId } = req.query;
    const _id = `${UserId}-${ChatId}`;

    const document = await Documents.findOne({ _id });
    const content = document?.content;

    const partitions = [];
    let partitionSize = 60000;
    let i = 0;

    while (i < content?.length) {
      const part = content?.substring(i, i + partitionSize);
      const tokenCount = getTokens(part);

      if (tokenCount > 15000) {
        partitionSize = Math.floor(partitionSize / 2);
        continue;
      }

      partitions.push(part);
      i += partitionSize;
      partitionSize = 60000;
    }

    const summaries = await Promise.all(partitions.map(fetchSummary));
    let allSummaries = summaries.join("\n\n");

    while (getTokens(allSummaries) > 15000) {
      const mid = allSummaries.length / 2;
      const part1 = allSummaries.substring(0, mid);
      const part2 = allSummaries.substring(mid);
      const summary1 = await fetchSummary(part1);
      const summary2 = await fetchSummary(part2);
      allSummaries = `${summary1}\n\n${summary2}`;
    }

    const prompt = `You are a text summarizer. Write a detailed summary of the following text, (text: ${allSummaries}). Begin Your Reply with "Here is the summary of the document"`;

    const gptMessages = [{ role: "system", content: prompt }];
    console.log("Summarizing Complete");
    res.status(200).send({ gptMessages });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ message: error.message });
  } finally {
    console.timeEnd("Handler Execution Time");
  }
}
