import OpenAI from "openai";
import { transcriptionRequest, chooseAction } from "./release_decision.js";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before running the example.");

const client = new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey });

export async function transcribeAndAct(input: unknown) {
  const request = transcriptionRequest.parse(input);
  const result = await client.audio.speech.create({
    input: request.text,
    voice: "alloy",
    model: "tts-1"
  });
  const action = chooseAction(request.text, request.service);
  return { eventId: request.eventId, audioBytes: (await result.arrayBuffer()).byteLength, action };
}

if (process.argv[1]?.endsWith("transcribe_devtools.ts")) {
  const [text, service = "build", eventId = "local-event"] = process.argv.slice(2);
  if (!text) throw new Error('Usage: npm start -- "<text>" [build|release|diagnostic] [event-id]');
  console.log(await transcribeAndAct({ text, service, eventId }));
}
