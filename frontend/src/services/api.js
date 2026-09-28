const API_BASE = "http://127.0.0.1:8000";

/**
 * Helper to make API calls with graceful fallback
 */
async function fetchWithFallback(endpoint, options = {}, fallbackData = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data, isLive: true };
  } catch (err) {
    console.warn(`[API] ${endpoint} fell back to offline demo:`, err.message);
    return { data: fallbackData, isLive: false, error: err.message };
  }
}

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeNegotiation(quoteData, fallback) {
  return fetchWithFallback(
    "/api/negotiation/analyze",
    {
      method: "POST",
      body: JSON.stringify({
        supplier: quoteData.supplier,
        product: quoteData.product,
        quantity: parseFloat(quoteData.quantity) || 1,
        unit: quoteData.unit || "units",
        price_per_unit: parseFloat(quoteData.price_per_unit) || 0,
        delivery_fee: parseFloat(quoteData.delivery_fee) || 0,
        payment_terms: quoteData.payment_terms || "Immediate",
      }),
    },
    fallback
  );
}

export async function reflectNegotiation(quoteData, fallback) {
  return fetchWithFallback(
    "/api/negotiation/reflect",
    {
      method: "POST",
      body: JSON.stringify({
        supplier: quoteData.supplier,
        product: quoteData.product,
        current_quote: {
          quantity: parseFloat(quoteData.quantity) || 1,
          unit: quoteData.unit || "units",
          price_per_unit: parseFloat(quoteData.price_per_unit) || 0,
          delivery_fee: parseFloat(quoteData.delivery_fee) || 0,
          payment_terms: quoteData.payment_terms || "Immediate",
        },
      }),
    },
    fallback
  );
}

export async function recordNegotiationOutcome(outcomeData, fallback) {
  return fetchWithFallback(
    "/api/negotiation/outcome",
    {
      method: "POST",
      body: JSON.stringify({
        supplier: outcomeData.supplier,
        product: outcomeData.product,
        negotiation_summary: outcomeData.negotiation_summary,
        outcome: outcomeData.outcome,
        successful_concession: outcomeData.successful_concession,
        final_price: parseFloat(outcomeData.final_price) || 0,
        final_delivery_fee: parseFloat(outcomeData.final_delivery_fee) || 0,
        lessons: outcomeData.lessons,
      }),
    },
    fallback
  );
}

export async function getSupplierMemories(supplierName, fallback) {
  return fetchWithFallback(
    `/api/memory/${encodeURIComponent(supplierName)}`,
    { method: "GET" },
    fallback
  );
}
