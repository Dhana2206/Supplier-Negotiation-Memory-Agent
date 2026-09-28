import os
import logging
from pathlib import Path
import re
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from hindsight_client import Hindsight
from pydantic import BaseModel, Field

# Load .env from backend directory or current working directory
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv()

app = FastAPI(
    title="Supplier Negotiation Memory Agent",
    description="AI negotiation co-pilot powered by Hindsight",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hindsight = Hindsight(
    base_url=os.getenv("HINDSIGHT_BASE_URL"),
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "Supplier-Negotiation-Memory-Agent")
logger = logging.getLogger(__name__)


# Pydantic Schemas

class QuoteRequest(BaseModel):
    supplier: str = Field(min_length=1)
    product: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1)
    price_per_unit: float = Field(gt=0)
    delivery_fee: float = Field(ge=0)
    payment_terms: str = Field(min_length=1)


class OutcomeRequest(BaseModel):
    supplier: str = Field(min_length=1)
    product: str = Field(min_length=1)
    negotiation_summary: str = Field(min_length=1)
    outcome: str = Field(min_length=1)
    successful_concession: str = Field(min_length=1)
    final_price: float = Field(gt=0)
    final_delivery_fee: float = Field(ge=0)
    lessons: str = Field(min_length=1)
    quantity: float | None = None
    category: str | None = None


class ReflectRequest(BaseModel):
    supplier: str
    product: str
    current_quote: Any


# Memory Relevance Filtering Helpers

UNRELATED_PRODUCT_PATTERNS = [
    r"\bsunflower\s+oil\b",
    r"\bmustard\s+oil\b",
    r"\bolive\s+oil\b",
    r"\bsunflower\b",
    r"\bedible\s+oil\b",
    r"\bcooking\s+oil\b",
    r"\bsugar\b",
    r"\brice\b",
]


def is_unrelated_product_memory(text: str, current_product: str) -> bool:
    """
    Checks if a memory explicitly belongs to a known unrelated domain/product.
    For example, memories mentioning 'sunflower oil', 'mustard oil', 'olive oil',
    'rice', 'sugar' when the current product does not relate to them.
    Uses regex word boundaries to prevent substring collisions (e.g. 'rice' in 'price').
    """
    if not text or not current_product:
        return False

    for pat in UNRELATED_PRODUCT_PATTERNS:
        if re.search(pat, text, re.IGNORECASE) and not re.search(pat, current_product, re.IGNORECASE):
            return True
    return False


def get_search_tokens(text: str) -> list[str]:
    """
    Extracts alphanumeric tokens with length >= 3 from a name/phrase.
    E.g., 'Microcontroller (MCU)' -> ['microcontroller', 'mcu']
    """
    if not text:
        return []
    cleaned = re.sub(r"[^\w\s]", " ", text)
    generic_terms = {
        "a", "an", "and", "assembly", "bearing", "bearings", "company",
        "component", "components", "corp", "corporation", "deal", "deals",
        "delivery", "device", "devices", "electrical", "electronic",
        "electronics", "energy", "enterprise", "enterprises", "for", "from",
        "global", "group", "hardware", "history", "holding", "holdings",
        "industrial", "industry", "international", "item", "items", "lesson",
        "lessons", "limited", "ltd", "manufacturing", "memory", "memories",
        "motor", "motors", "negotiation", "negotiations", "of", "order",
        "orders", "outcome", "outcomes", "part", "parts", "per", "piece",
        "pieces", "power", "price", "prices", "private", "product", "products",
        "pvt", "quote", "quotes", "service", "services", "solution", "solutions",
        "supplier", "suppliers", "supply", "supplies", "system", "systems",
        "technology", "technologies", "the", "unit", "units",
    }
    return [
        token.lower()
        for token in cleaned.split()
        if len(token) >= 3 and token.lower() not in generic_terms
    ]


def normalize_entity(value: str) -> str:
    """Normalize entity names for exact, punctuation-insensitive comparisons."""
    return " ".join(re.sub(r"[^\w\s]", " ", value.lower()).split())


def get_explicit_entity_values(text: str, field: str) -> list[str]:
    """Read explicit Supplier:/Product: labels from retained memory text."""
    pattern = rf"(?im)(?:^|[\r\n|])\s*{re.escape(field)}\s*:\s*([^|\r\n;]+)"
    return [match.strip() for match in re.findall(pattern, text) if match.strip()]


def entity_value_matches(value: str, entity: str, *, product: bool = False) -> bool:
    normalized_value = normalize_entity(value)
    normalized_entity = normalize_entity(entity)
    if not normalized_value or not normalized_entity:
        return False
    if normalized_value == normalized_entity:
        return True

    if product:
        # Explicit product labels are authoritative; do not accept a partial token.
        return False

    tokens = get_search_tokens(entity)
    return any(re.search(rf"\b{re.escape(token)}\b", normalized_value) for token in tokens)


def contains_product_identity(text: str, product: str) -> bool:
    """Require a full product phrase or a sufficiently strong set of product terms."""
    normalized_text = normalize_entity(text)
    normalized_product = normalize_entity(product)
    if not normalized_text or not normalized_product:
        return False

    if re.search(rf"\b{re.escape(normalized_product)}\b", normalized_text):
        return True

    tokens = get_search_tokens(product)
    if not tokens:
        return False

    # A long distinctive term can identify products such as Microcontroller (MCU).
    strong_tokens = [token for token in tokens if len(token) >= 5]
    required_tokens = strong_tokens or tokens
    return all(
        re.search(rf"\b{re.escape(token)}\b", normalized_text)
        for token in required_tokens
    )


def is_memory_relevant_to_supplier(text: str, supplier: str, product: str) -> bool:
    """
    Determines whether a memory is relevant to the target supplier.
    """
    if not text or not supplier:
        return False
    if is_unrelated_product_memory(text, product):
        return False

    explicit_suppliers = get_explicit_entity_values(text, "Supplier")
    if explicit_suppliers:
        return any(
            entity_value_matches(value, supplier)
            for value in explicit_suppliers
        )

    # Unstructured memories may mention another supplier in the body. Treat only
    # the opening label/title as the supplier identity, not any later mention.
    supplier_subject = re.split(r"[\r\n:;]|\u2014|\u2013", text, maxsplit=1)[0]
    normalized_text = normalize_entity(supplier_subject)
    normalized_supplier = normalize_entity(supplier)
    if re.search(rf"\b{re.escape(normalized_supplier)}\b", normalized_text):
        return True

    tokens = get_search_tokens(supplier)
    return any(
        re.search(rf"\b{re.escape(token)}\b", normalized_text)
        for token in tokens
    )


def is_memory_relevant_to_product(text: str, product: str) -> bool:
    """
    Determines whether a memory is relevant to the target product.
    """
    if not text or not product:
        return False
    if is_unrelated_product_memory(text, product):
        return False

    explicit_products = get_explicit_entity_values(text, "Product")
    if explicit_products:
        return any(
            entity_value_matches(value, product, product=True)
            for value in explicit_products
        )

    return contains_product_identity(text, product)


# Existing Working Endpoints (Preserved)

@app.get("/")
def home():
    return {
        "message": "Supplier Negotiation Memory Agent API is running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/memory/test")
def test_memory():
    hindsight.retain(
        bank_id=BANK_ID,
        content=(
            "Supplier A previously quoted sunflower oil at ₹82 per kg "
            "for 100 kg with free delivery. The supplier refused a lower "
            "unit price but agreed to free delivery."
        )
    )

    memories = hindsight.recall(
        bank_id=BANK_ID,
        query="What negotiation tactic worked with Supplier A?"
    )

    return {
        "message": "Memory stored and recalled successfully",
        "memories": str(memories)
    }


# Required MVP Negotiation Endpoints

@app.post("/api/negotiation/analyze")
def analyze_negotiation(quote: QuoteRequest):
    """
    Accepts quote details and performs two focused Hindsight RECALL queries:
    A) Supplier-specific memory for the requested supplier and product.
    B) Product-specific memory for the requested product across suppliers.
    Filters out unrelated memories (e.g. old Sunflower Oil test data).
    """
    supplier_query = (
        f"Supplier-specific negotiation history for supplier '{quote.supplier}' "
        f"involving product '{quote.product}'. Retrieve previous quotes, final prices, "
        f"concessions, delivery terms, payment terms, successful tactics and failed tactics."
    )
    product_query = (
        f"Historical procurement and negotiation information for product '{quote.product}', "
        f"including previous prices, quantities, supplier quotes, concessions and outcomes."
    )

    try:
        supplier_recall = hindsight.recall(
            bank_id=BANK_ID,
            query=supplier_query
        )
        product_recall = hindsight.recall(
            bank_id=BANK_ID,
            query=product_query
        )
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve supplier negotiation memory."
        )

    raw_supplier_texts = (
        [r.text for r in supplier_recall.results]
        if hasattr(supplier_recall, "results") and supplier_recall.results
        else []
    )
    raw_product_texts = (
        [r.text for r in product_recall.results]
        if hasattr(product_recall, "results") and product_recall.results
        else []
    )

    # Apply strict relevance filtering
    supplier_memories = [
        m for m in raw_supplier_texts
        if is_memory_relevant_to_supplier(m, quote.supplier, quote.product)
    ]
    product_memories = [
        m for m in raw_product_texts
        if is_memory_relevant_to_product(m, quote.product)
    ]

    # Combined deduplicated list for backward compatibility with frontend
    combined_memories: list[str] = []
    for mem in supplier_memories + product_memories:
        if mem not in combined_memories:
            combined_memories.append(mem)

    return {
        "supplier": quote.supplier,
        "product": quote.product,
        "current_quote": {
            "quantity": quote.quantity,
            "unit": quote.unit,
            "price_per_unit": quote.price_per_unit,
            "delivery_fee": quote.delivery_fee,
            "payment_terms": quote.payment_terms
        },
        "supplier_memories": supplier_memories,
        "product_memories": product_memories,
        "memories": combined_memories,
        "recalled_memory": "\n".join(combined_memories)
    }


@app.post("/api/negotiation/outcome")
def record_outcome(data: OutcomeRequest):
    """
    Records completed negotiation experience using Hindsight RETAIN.
    Stores structured details with explicit natural-language labels for clean recall.
    """
    lines = [
        f"Supplier: {data.supplier}",
        f"Product: {data.product}",
    ]
    if getattr(data, "category", None):
        lines.append(f"Category: {data.category}")
    if getattr(data, "quantity", None) is not None:
        lines.append(f"Quantity: {data.quantity}")
    price_str = f"₹{int(data.final_price)}" if data.final_price.is_integer() else f"₹{data.final_price}"
    fee_str = f"₹{int(data.final_delivery_fee)}" if data.final_delivery_fee.is_integer() else f"₹{data.final_delivery_fee}"
    lines.extend([
        f"Final Price: {price_str}",
        f"Final Delivery Fee: {fee_str}",
        f"Successful Concession: {data.successful_concession}",
        f"Outcome: {data.outcome}",
        f"Negotiation Summary: {data.negotiation_summary}",
        f"Lesson: {data.lessons}",
    ])
    experience = "\n".join(lines)

    try:
        hindsight.retain(
            bank_id=BANK_ID,
            content=experience
        )
    except Exception as exc:
        safe_message = str(exc).replace(experience, "[redacted negotiation content]")
        api_key = os.getenv("HINDSIGHT_API_KEY")
        if api_key:
            safe_message = safe_message.replace(api_key, "[redacted]")
        for value in data.model_dump().values():
            if isinstance(value, str) and value:
                safe_message = safe_message.replace(value, "[redacted]")
        logger.error(
            "Hindsight retain failed (exception_type=%s): %s",
            type(exc).__name__,
            safe_message,
        )
        raise HTTPException(
            status_code=503,
            detail="Unable to store negotiation outcome in memory."
        )

    return {
        "message": "Negotiation outcome stored in Hindsight memory",
        "supplier": data.supplier,
        "product": data.product,
        "stored_memory": experience,
        "lesson": data.lessons
    }


@app.post("/api/negotiation/reflect")
def reflect_negotiation(data: ReflectRequest):
    """
    Uses focused supplier and product recall context and Hindsight REFLECT to
    synthesize strategic negotiation guidance and counter-offer recommendations.
    Explicitly distinguishes supplier memory from cross-supplier product memory.
    """
    if isinstance(data.current_quote, dict):
        quote_desc = ", ".join(f"{k}: {v}" for k, v in data.current_quote.items())
    else:
        quote_desc = str(data.current_quote)

    # 1. Focused Hindsight RECALL: Separate queries for supplier and product
    supplier_query = (
        f"Supplier-specific negotiation history for supplier '{data.supplier}' "
        f"involving product '{data.product}'. Retrieve previous quotes, final prices, "
        f"concessions, delivery terms, payment terms, successful tactics and failed tactics."
    )
    product_query = (
        f"Historical procurement and negotiation information for product '{data.product}', "
        f"including previous prices, quantities, supplier quotes, concessions and outcomes."
    )

    try:
        supplier_recall = hindsight.recall(
            bank_id=BANK_ID,
            query=supplier_query
        )
        product_recall = hindsight.recall(
            bank_id=BANK_ID,
            query=product_query
        )
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve negotiation history."
        )

    raw_supplier_texts = (
        [r.text for r in supplier_recall.results]
        if hasattr(supplier_recall, "results") and supplier_recall.results
        else []
    )
    raw_product_texts = (
        [r.text for r in product_recall.results]
        if hasattr(product_recall, "results") and product_recall.results
        else []
    )

    # Filter out unrelated memories
    supplier_memories = [
        m for m in raw_supplier_texts
        if is_memory_relevant_to_supplier(m, data.supplier, data.product)
    ]
    product_memories = [
        m for m in raw_product_texts
        if is_memory_relevant_to_product(m, data.product)
    ]

    recalled_memories: list[str] = []
    for mem in supplier_memories + product_memories:
        if mem not in recalled_memories:
            recalled_memories.append(mem)

    supplier_mem_block = (
        "\n".join(f"- {m}" for m in supplier_memories)
        if supplier_memories
        else "No prior recorded memories with this supplier."
    )
    product_mem_block = (
        "\n".join(f"- {m}" for m in product_memories)
        if product_memories
        else f"No prior recorded memories for {data.product} across suppliers."
    )

    # 2. Hindsight REFLECT: Structured tactical reasoning
    reflect_query = (
        f"You are an expert B2B procurement negotiation strategist. "
        f"Analyze the quote from '{data.supplier}' for product '{data.product}'.\n\n"
        f"SUPPLIER MEMORY (What this supplier has done in previous negotiations):\n"
        f"{supplier_mem_block}\n\n"
        f"PRODUCT MEMORY (Historical pricing and negotiation patterns for this product across suppliers):\n"
        f"{product_mem_block}\n\n"
        f"CURRENT CONTEXT (The quote currently being evaluated):\n"
        f"Supplier: {data.supplier}, Product: {data.product}, Current Quote: {quote_desc}\n\n"
        f"CRITICAL REASONING RULES:\n"
        f"1. Historical price is a benchmark/context, NOT an automatically correct target price. Do NOT blindly recommend the old lowest price.\n"
        f"2. If the current quote is higher than historical benchmark, evaluate whether order volume, inflation, or market factors explain the difference before demanding concessions.\n"
        f"3. If the current quote is already competitive or below historical levels, leverage other strategic concessions such as quality/specification, delivery fee waiver, payment terms, MOQ, lead time, warranty, and volume discounts.\n"
        f"4. Do NOT use or mention unrelated products (e.g. agricultural oils, food items) when analyzing industrial/electronic procurement.\n\n"
        f"Provide a structured negotiation strategy:\n"
        f"1. Benchmark Price Comparison with previous orders and context.\n"
        f"2. Supplier's Typical Negotiation Patterns and concession tendencies.\n"
        f"3. Recommended Counter-Offer and Tactical Script.\n"
        f"4. Specific Levers to push (delivery fees, payment terms, volume commitments, lead times)."
    )

    try:
        reflection = hindsight.reflect(
            bank_id=BANK_ID,
            query=reflect_query,
            context=f"Supplier: {data.supplier} | Product: {data.product} | Quote: {quote_desc}"
        )
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate AI negotiation strategy."
        )

    return {
        "supplier": data.supplier,
        "product": data.product,
        "current_quote": data.current_quote,
        "supplier_memories": supplier_memories,
        "product_memories": product_memories,
        "recalled_memories": recalled_memories,
        "strategy": reflection.text,
        "recommendation": reflection.text
    }


@app.get("/api/memory/{supplier}")
def get_supplier_memories(supplier: str):
    """
    Retrieves all relevant Hindsight memories for a given supplier.
    """
    query = (
        f"Retrieve all negotiation history, past quotes, pricing, concessions, "
        f"promises, and outcomes for supplier {supplier}."
    )
    recalled = hindsight.recall(bank_id=BANK_ID, query=query)

    memory_items = []
    if hasattr(recalled, "results") and recalled.results:
        for r in recalled.results:
            if supplier.lower() in r.text.lower() or (r.scores and r.scores.final and r.scores.final > 0.05):
                # Filter out obvious cross-domain test memories unless requested
                if not is_unrelated_product_memory(r.text, "") or "oil" in supplier.lower():
                    memory_items.append(r.text)

    # Fallback to search_query if semantic recall didn't catch direct mentions
    if not memory_items:
        listed = hindsight.list_memories(bank_id=BANK_ID, search_query=supplier)
        if hasattr(listed, "items") and listed.items:
            for item in listed.items:
                if item.text not in memory_items:
                    memory_items.append(item.text)

    return {
        "supplier": supplier,
        "count": len(memory_items),
        "memories": memory_items
    }
