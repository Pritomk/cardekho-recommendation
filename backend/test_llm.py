import asyncio
from app.llm.factory import get_llm_service

async def test_llm():
    print("Initializing LLM Service...")
    llm = get_llm_service()
    
    print(f"Provider loaded: {llm.__class__.__name__}")
    
    prompt = "Explain in one sentence why the sky is blue."
    print(f"\nSending Prompt: '{prompt}'")
    
    print("\nWaiting for NVIDIA API response...\n")
    try:
        # Depending on how the provider is built, it might be sync. 
        # HTTPProviderLLMService is synchronous in the current implementation.
        response = llm.generate(prompt)
        print("--- RESPONSE START ---")
        print(response)
        print("--- RESPONSE END ---")
        print("\n✅ LLM integration is working perfectly!")
    except Exception as e:
        print(f"\n❌ Error calling LLM: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm())
