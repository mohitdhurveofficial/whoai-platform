import OpenAI from "openai";
import { validateApiKey } from "@/lib/security/validate-api-key";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return Response.json(
      { error: "Missing API Key" },
      { status: 401 }
    );
  }

  const key = auth.replace("Bearer ", "");

  const apiKey = await validateApiKey(key);

  if (!apiKey) {
    return Response.json(
      { error: "Invalid API Key" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const completion = await openai.chat.completions.create({
    model: body.model || "gpt-4o-mini",
    messages: body.messages,
  });

  return Response.json(completion);
}