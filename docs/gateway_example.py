import os
import asyncio
from openai import AsyncOpenAI

# 1. Make sure your local FastAPI gateway is running
WHOAI_GATEWAY_URL = "http://localhost:8001/api/v1/gateway/openai"

# 2. Replace this with a token you generated in the Next.js UI
AGENT_TOKEN = os.getenv("WHOAI_AGENT_TOKEN", "REPLACE_ME_WITH_A_GENERATED_TOKEN")

async def test_gateway():
    print(f"Testing WHOAI Gateway at: {WHOAI_GATEWAY_URL}")
    print(f"Using Agent Token: {AGENT_TOKEN[:8]}...\n")
    
    # Initialize the official OpenAI SDK pointing to our WHOAI Gateway
    client = AsyncOpenAI(
        base_url=WHOAI_GATEWAY_URL,
        api_key=AGENT_TOKEN
    )

    print("--- Testing Standard Completion ---")
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "What is the capital of France?"}
            ]
        )
        print("Response received successfully!")
        print(f"Content: {response.choices[0].message.content}")
    except Exception as e:
        print(f"Error during standard completion: {e}")

    print("\n--- Testing Streaming Completion ---")
    try:
        stream = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": "Count from 1 to 5, writing out the words."}
            ],
            stream=True
        )
        print("Stream started successfully! Receiving chunks:")
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                # Print each chunk as it arrives to verify TTFT
                print(chunk.choices[0].delta.content, end="", flush=True)
        print("\n\nStream finished!")
    except Exception as e:
        print(f"Error during streaming completion: {e}")

if __name__ == "__main__":
    # Ensure OPENAI_API_KEY is available in your FastAPI .env before running
    asyncio.run(test_gateway())