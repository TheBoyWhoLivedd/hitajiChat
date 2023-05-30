import type {
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
} from "openai";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";

export const runtime = "edge";

const requestGPT3Turbo = async (messages: ChatCompletionRequestMessage[]) => {
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
        // Authorization: `Bearer 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`,
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
  // console.log(req.json())
  const { gpt } = await req.json();

  try {
    const messageStream = await requestGPT3Turbo(gpt);

    return new Response(messageStream);
  } catch (error: any) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
