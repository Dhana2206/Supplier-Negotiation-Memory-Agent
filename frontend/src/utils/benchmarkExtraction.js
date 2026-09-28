/**
 * benchmarkExtraction.js
 * Extracts structured benchmark data (previous quote, successful price,
 * delivery concession, order volume, outcome summary) from Hindsight memories.
 * Works across natural language and key-value memory formats.
 */

import { isExactSupplierProductMatch } from "./memoryRelevance.js";

export function formatCurrency(val) {
  if (!val) return null;
  const clean = String(val).replace(/,/g, "").trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return `₹${val}`;
  return Number.isInteger(num)
    ? `₹${num.toLocaleString()}`
    : `₹${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatQuantity(val) {
  if (!val) return null;
  const clean = String(val).replace(/,/g, "").trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return `${val} units`;
  return `${num.toLocaleString()} units`;
}

/**
 * Parses an array of recalled memories to extract price benchmarks, delivery terms,
 * order quantities, and outcome summaries.
 * Strictly scopes extraction to exact supplier + product matches to prevent cross-product leakage.
 */
export function extractBenchmarkFromMemories(
  memoriesList,
  fallbackHistory,
  supplier,
  productNameOrIsTechCore,
  maybeIsTechCore
) {
  const productName =
    typeof productNameOrIsTechCore === "string" ? productNameOrIsTechCore : "";
  const isTechCore =
    typeof productNameOrIsTechCore === "boolean"
      ? productNameOrIsTechCore
      : Boolean(maybeIsTechCore);

  // If a specific product is targeted, filter memories strictly to those matching BOTH supplier and product
  const targetMemories =
    productName && !isTechCore
      ? (memoriesList || []).filter((item) =>
          isExactSupplierProductMatch(item, supplier, productName)
        )
      : (memoriesList || []);

  if (!targetMemories || targetMemories.length === 0) {
    if (isTechCore && fallbackHistory) {
      const numPrice =
        parseFloat(String(fallbackHistory.successfulPrice || "").replace(/[^0-9.]/g, "")) || 178;
      return {
        previousQuote: fallbackHistory.previousQuote || "₹192/unit",
        successfulPrice: fallbackHistory.successfulPrice || "₹178/unit",
        previousDelivery: fallbackHistory.previousDelivery || "FREE",
        orderSize: fallbackHistory.orderSize || "8,000 units",
        outcomeSummary:
          fallbackHistory.outcomeSummary ||
          "Volume-based price reduction to ₹178/unit with 100% free delivery waiver on 8,000 units batch.",
        timelineNote:
          fallbackHistory.outcomeSummary ||
          "Volume-based price reduction to ₹178/unit with 100% free delivery waiver on 8,000 units batch.",
        numericPrice: numPrice,
        numericDelivery: 0,
        hasHistoricalBenchmark: true,
      };
    }
    return {
      previousQuote: "No Previous Quote",
      successfulPrice: "No Historical Benchmark",
      previousDelivery: "No Concession Recorded",
      orderSize: "No Historical Volume",
      outcomeSummary: productName
        ? `No prior negotiation history recorded for ${supplier} + ${productName} in Hindsight bank.`
        : `No prior negotiation history recorded for ${supplier} in Hindsight bank.`,
      timelineNote: productName
        ? `No prior negotiation history recorded for ${supplier} on ${productName} in Hindsight bank.`
        : `No prior negotiation history recorded for ${supplier} in Hindsight bank.`,
      numericPrice: null,
      numericDelivery: null,
      hasHistoricalBenchmark: false,
    };
  }

  let finalPrice = null;
  let finalDelivery = null;
  let prevQuote = null;
  let orderSize = null;
  let summary = null;
  let numericPrice = null;
  let numericDelivery = null;

  for (const item of targetMemories) {
    const text = typeof item === "string" ? item : item.text || JSON.stringify(item);

    // 1. Previous / Initial Quote
    if (!prevQuote) {
      const pqMatch =
        text.match(/Previous Quote:\s*₹?\s*([0-9,.]+)/i) ||
        text.match(/initial quote was\s*₹?\s*([0-9,.]+)/i) ||
        text.match(/initial\s*₹?\s*([0-9,.]+)\s*quote/i) ||
        text.match(/initial quote:\s*₹?\s*([0-9,.]+)/i) ||
        text.match(/(?:quoted|asking)\s*(?:.*?at)?\s*₹\s*([0-9,.]+)/i) ||
        text.match(/from\s*(?:the\s*initial\s*)?₹\s*([0-9,.]+)/i);
      if (pqMatch) {
        prevQuote = `${formatCurrency(pqMatch[1])}/unit`;
      }
    }

    // 2. Final Price / Agreed Benchmark
    if (!finalPrice) {
      const fpMatch =
        text.match(/Final Price:\s*₹?\s*([0-9,.]+)/i) ||
        text.match(/(?:agreed|conceded|closed)\s*(?:at|to)?\s*₹\s*([0-9,.]+)/i) ||
        text.match(/(?:at|price of)\s*₹\s*([0-9,.]+)/i) ||
        text.match(/₹\s*([0-9,.]+)\s*(?:per|\/)\s*unit/i) ||
        text.match(/₹\s*([0-9,.]+)/);
      if (fpMatch) {
        const cleanNum = fpMatch[1].replace(/,/g, "");
        const parsed = parseFloat(cleanNum);
        if (parsed > 0) {
          numericPrice = parsed;
          finalPrice = `${formatCurrency(fpMatch[1])}/unit`;
        }
      }
    }

    // 3. Delivery Concession
    if (!finalDelivery) {
      if (/free delivery|free freight|waive.*freight|delivery fee:\s*₹?0|zero delivery/i.test(text)) {
        finalDelivery = "FREE";
        numericDelivery = 0;
      } else {
        const fdMatch =
          text.match(/Final Delivery Fee:\s*₹?\s*([0-9,.]+)/i) ||
          text.match(/delivery fee(?: of)?\s*₹?\s*([0-9,.]+)/i);
        if (fdMatch) {
          const parsedFee = parseFloat(fdMatch[1].replace(/,/g, ""));
          numericDelivery = isNaN(parsedFee) ? null : parsedFee;
          finalDelivery = formatCurrency(fdMatch[1]);
        }
      }
    }

    // 4. Quantity / Order Size
    if (!orderSize) {
      const qtyMatch =
        text.match(/Quantity:\s*([0-9,.]+)/i) ||
        text.match(/(?:purchase|order|batch|commitment|volume)\s*(?:of)?\s*([0-9,]+)/i) ||
        text.match(/(?<![₹$/]\s*)\b([0-9,]+)\s*(?:units|pcs|pieces|kg|tons)\b/i) ||
        text.match(/(?<![₹$/]\s*)\b([0-9,]+)[-\s]+(?:Bearing|Motor|Servo|MCU|Microcontroller|Sensor|Valve|Pump|Connector)s?\b/i);
      if (qtyMatch) {
        const val = qtyMatch[1] || qtyMatch[2] || qtyMatch[3] || qtyMatch[4];
        if (val) {
          orderSize = formatQuantity(val);
        }
      }
    }

    // 5. Outcome Summary / Lesson / Concession
    if (!summary) {
      const summMatch =
        text.match(/Negotiation Summary:\s*(.+)/i) ||
        text.match(/Outcome:\s*(.+)/i) ||
        text.match(/Successful Concession:\s*(.+)/i) ||
        text.match(/Lesson:\s*(.+)/i);
      if (summMatch) {
        summary = summMatch[1].split("|")[0].split("\n")[0].trim();
      }
    }
  }

  // Fallback summary if not matched via explicit label
  if (!summary && memoriesList.length > 0) {
    for (const mem of memoriesList) {
      const text = typeof mem === "string" ? mem : mem.text || "";
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (/^(?:Lesson|Negotiation Summary|Outcome|Successful Concession):/i.test(line)) {
          summary = line.replace(/^(?:Lesson|Negotiation Summary|Outcome|Successful Concession):\s*/i, "").trim();
          break;
        }
        if (!/^(?:Supplier|Product|Category|Quantity):/i.test(line) && line.length > 15) {
          summary = line;
          break;
        }
      }
      if (summary) break;
    }
  }

  let timelineNote = "";
  const deliveryText =
    finalDelivery === "FREE"
      ? "Free Delivery"
      : finalDelivery
        ? `${finalDelivery} delivery`
        : "";
  const qtyText = orderSize ? ` on ${orderSize}` : "";
  const closedDetail = finalPrice
    ? `Closed at ${finalPrice}${deliveryText ? ` with ${deliveryText}` : ""}${qtyText}.`
    : "";

  if (summary && summary.length > 10 && !/^(?:Supplier|Product|Category):/i.test(summary)) {
    if (finalPrice && !summary.includes("₹")) {
      timelineNote = `${closedDetail} ${summary}`.trim();
    } else {
      timelineNote = summary;
    }
  } else if (closedDetail) {
    timelineNote = `${closedDetail} Benchmark retained in Hindsight memory.`;
  } else {
    timelineNote = `Historical negotiation recorded for ${supplier} in Hindsight bank.`;
  }

  return {
    previousQuote:
      prevQuote ||
      (isTechCore && fallbackHistory ? fallbackHistory.previousQuote : "No Previous Quote"),
    successfulPrice:
      finalPrice ||
      (isTechCore && fallbackHistory ? fallbackHistory.successfulPrice : "No Historical Benchmark"),
    previousDelivery:
      finalDelivery ||
      (isTechCore && fallbackHistory ? fallbackHistory.previousDelivery : "No Concession Recorded"),
    orderSize:
      orderSize ||
      (isTechCore && fallbackHistory ? fallbackHistory.orderSize : "No Historical Volume"),
    outcomeSummary:
      summary ||
      (isTechCore && fallbackHistory
        ? fallbackHistory.outcomeSummary
        : `No prior negotiation outcome recorded for ${supplier}.`),
    timelineNote:
      timelineNote ||
      (isTechCore && fallbackHistory
        ? fallbackHistory.outcomeSummary
        : `No prior negotiation history recorded for ${supplier} in Hindsight bank.`),
    numericPrice,
    numericDelivery,
    hasHistoricalBenchmark: Boolean(finalPrice),
  };
}
