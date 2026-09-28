import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

client = Hindsight(
    base_url=os.getenv("HINDSIGHT_BASE_URL"),
    api_key=os.getenv("HINDSIGHT_API_KEY"),
)

bank_id = os.getenv("HINDSIGHT_BANK_ID")

client.retain(
    bank_id=bank_id,
    content="Supplier A quoted sunflower oil at ₹82 per kg with free delivery for 100 kg. When we asked for a lower unit price, the supplier refused, but agreed to free delivery for the repeat order."
)

result = client.recall(
    bank_id=bank_id,
    query="What negotiation tactics worked with Supplier A for sunflower oil?"
)

print("\nHINDSIGHT RECALL RESULT:\n")
print(result)