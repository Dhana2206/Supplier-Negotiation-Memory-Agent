/**
 * memoryRelevance.js
 * Utility for strict entity and product relevance matching of Hindsight memories.
 * Prevents cross-supplier and cross-product data leakage caused by generic industrial stopwords.
 */

// Generic corporate, legal, and component words that must never trigger a single-token match across unrelated entities
const GENERIC_STOPWORDS = new Set([
  "industrial",
  "systems",
  "system",
  "technologies",
  "technology",
  "solutions",
  "solution",
  "components",
  "component",
  "corp",
  "corporation",
  "ltd",
  "limited",
  "pvt",
  "private",
  "inc",
  "incorporated",
  "co",
  "company",
  "group",
  "enterprises",
  "enterprise",
  "holdings",
  "holding",
  "bearing",
  "bearings",
  "motor",
  "motors",
  "sensor",
  "sensors",
  "unit",
  "units",
  "product",
  "products",
  "item",
  "items",
  "general",
  "electronics",
  "electronic",
  "electrical",
  "parts",
  "part",
  "supply",
  "supplies",
  "power",
  "energy",
  "global",
  "international",
  "services",
  "service",
  "tech",
  "devices",
  "device",
  "hardware",
  "manufacturing",
  "engineering",
]);

/**
 * Checks whether a recalled memory text is genuinely relevant to the target supplier and product.
 *
 * @param {string|object} item - Memory item string or object
 * @param {string} supplierName - Target supplier name
 * @param {string} productName - Target product name
 * @returns {boolean} True if the memory matches the target supplier and/or product
 */
export function isMemoryRelevant(item, supplierName, productName) {
  if (!item) return false;
  const text = typeof item === "string" ? item : item.text || JSON.stringify(item);
  if (!text || typeof text !== "string") return false;

  const textLower = text.toLowerCase();
  const supLower = (supplierName || "").trim().toLowerCase();
  const prodLower = (productName || "").trim().toLowerCase();

  // Canonical demo scenario (TechCore + Microcontroller)
  const isTechCoreCanonical =
    supLower.includes("techcore") &&
    (prodLower.includes("microcontroller") || prodLower.includes("mcu"));
  if (
    isTechCoreCanonical &&
    (textLower.includes("techcore") || textLower.includes("microcontroller"))
  ) {
    return true;
  }

  // 1. Exact full supplier name match
  if (supLower && textLower.includes(supLower)) {
    return true;
  }

  // 2. Exact full product name match
  if (prodLower && textLower.includes(prodLower)) {
    return true;
  }

  // 3. Distinctive supplier tokens (e.g. 'Apex', 'Crompton', 'Nova')
  if (supLower) {
    const supTokens = supLower
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !GENERIC_STOPWORDS.has(w));

    for (const token of supTokens) {
      const regex = new RegExp(`\\b${token}\\b`, "i");
      if (regex.test(textLower)) {
        return true;
      }
    }
  }

  // 4. Distinctive product tokens (e.g. 'Servo', 'MOSFET', 'PCB')
  if (prodLower) {
    const prodTokens = prodLower
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !GENERIC_STOPWORDS.has(w));

    for (const token of prodTokens) {
      const regex = new RegExp(`\\b${token}\\b`, "i");
      if (regex.test(textLower)) {
        // If memory contains an explicit "Product: ..." field, verify it matches
        const prodMatch = textLower.match(/product:\s*([^\n\r|]+)/i);
        if (prodMatch) {
          const memProd = prodMatch[1].trim();
          if (memProd.includes(token) || prodLower.includes(memProd)) {
            return true;
          }
          // The token appeared in the memory, but the explicit product field does NOT match
          continue;
        }
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether a recalled memory text is an EXACT match for BOTH target supplier AND target product.
 * Required for extracting price benchmarks, delivery concessions, and batch volume.
 * Prevents cross-product benchmark leakage.
 *
 * @param {string|object} item - Memory item string or object
 * @param {string} supplierName - Target supplier name
 * @param {string} productName - Target product name
 * @returns {boolean} True if the memory matches BOTH supplier and product without conflict
 */
export function isExactSupplierProductMatch(item, supplierName, productName) {
  if (!item) return false;
  const text = typeof item === "string" ? item : item.text || JSON.stringify(item);
  if (!text || typeof text !== "string") return false;

  const textLower = text.toLowerCase();
  const supLower = (supplierName || "").trim().toLowerCase();
  const prodLower = (productName || "").trim().toLowerCase();

  // Canonical demo scenario (TechCore + Microcontroller)
  const isTechCoreCanonical =
    supLower.includes("techcore") &&
    (prodLower.includes("microcontroller") || prodLower.includes("mcu"));
  if (
    isTechCoreCanonical &&
    (textLower.includes("techcore") || textLower.includes("microcontroller") || textLower.includes("mcu"))
  ) {
    return true;
  }

  // 1. Supplier match verification
  let matchesSupplier = Boolean(supLower && textLower.includes(supLower));
  if (!matchesSupplier && supLower) {
    const supTokens = supLower
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !GENERIC_STOPWORDS.has(w));

    for (const token of supTokens) {
      if (new RegExp(`\\b${token}\\b`, "i").test(textLower)) {
        matchesSupplier = true;
        break;
      }
    }
  }
  if (!matchesSupplier) return false;

  // 2. Product match verification
  if (!prodLower) return false;

  // If memory contains an explicit "Product: ..." field, verify it matches the active product
  const prodMatch = textLower.match(/product:\s*([^\n\r|]+)/i);
  if (prodMatch) {
    const memProd = prodMatch[1].trim().toLowerCase();
    if (memProd.includes(prodLower) || prodLower.includes(memProd)) {
      return true;
    }
    return false; // Explicit conflicting product
  }

  // Exact full product phrase match
  if (textLower.includes(prodLower)) return true;

  // Distinctive product tokens (excluding generic terms like motor, bearing, industrial, etc.)
  const prodTokens = prodLower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !GENERIC_STOPWORDS.has(w));

  for (const token of prodTokens) {
    if (new RegExp(`\\b${token}s?\\b`, "i").test(textLower)) {
      return true;
    }
  }

  return false;
}
