import asyncio
import httpx
import time
import argparse
import random
from typing import List

# WHOAI Load Testing Script
# Usage: python scripts/load_test.py --agents 50 --requests 1000 --tokens 10000

async def simulate_request(client: httpx.AsyncClient, api_url: str, api_key: str, agent_id: str, tokens: int):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "x-whoai-agent-id": agent_id,
        "Content-Type": "application/json"
    }
    
    # Simulate a typical LLM request payload
    payload = {
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": f"Generate a response with approximately {tokens} tokens."}],
        "max_tokens": tokens
    }
    
    start_time = time.time()
    try:
        response = await client.post(f"{api_url}/v1/chat/completions", json=payload, headers=headers)
        latency = time.time() - start_time
        return response.status_code, latency
    except Exception as e:
        latency = time.time() - start_time
        return 0, latency

async def run_load_test(api_url: str, api_key: str, num_agents: int, num_requests: int, avg_tokens: int):
    print(f"Starting Load Test...")
    print(f"Target: {api_url}")
    print(f"Agents: {num_agents}")
    print(f"Total Requests: {num_requests}")
    print(f"Average Tokens/Req: {avg_tokens}")
    print("-" * 30)
    
    # Generate mock agent IDs
    agent_ids = [f"agent_load_{i}" for i in range(num_agents)]
    
    # Prepare batch of tasks
    tasks = []
    
    limits = asyncio.Semaphore(100) # Max concurrent requests
    
    async def bound_request(client, agent_id, tokens):
        async with limits:
            return await simulate_request(client, api_url, api_key, agent_id, tokens)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for _ in range(num_requests):
            agent_id = random.choice(agent_ids)
            # Vary tokens slightly around the average
            tokens = int(random.gauss(avg_tokens, avg_tokens * 0.1))
            tasks.append(bound_request(client, agent_id, tokens))
            
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
    # Analyze results
    status_codes = {}
    latencies = []
    
    for status, latency in results:
        status_codes[status] = status_codes.get(status, 0) + 1
        latencies.append(latency)
        
    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    max_latency = max(latencies) if latencies else 0
    min_latency = min(latencies) if latencies else 0
    req_per_sec = num_requests / total_time if total_time > 0 else 0
    
    print(f"Test Complete in {total_time:.2f} seconds")
    print(f"Throughput: {req_per_sec:.2f} req/s")
    print(f"Average Latency: {avg_latency:.4f}s")
    print(f"Min Latency: {min_latency:.4f}s")
    print(f"Max Latency: {max_latency:.4f}s")
    print("Status Codes:")
    for code, count in sorted(status_codes.items()):
        print(f"  {code}: {count} requests")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WHOAI Gateway Load Testing")
    parser.add_argument("--url", type=str, default="http://localhost:8000", help="Gateway URL")
    parser.add_argument("--key", type=str, default="test_api_key", help="API Key")
    parser.add_argument("--agents", type=int, default=10, help="Number of simulated agents")
    parser.add_argument("--requests", type=int, default=100, help="Total number of requests")
    parser.add_argument("--tokens", type=int, default=1000, help="Average tokens per request")
    
    args = parser.parse_args()
    
    asyncio.run(run_load_test(args.url, args.key, args.agents, args.requests, args.tokens))
