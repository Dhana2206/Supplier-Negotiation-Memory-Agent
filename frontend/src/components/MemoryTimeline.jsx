import React from "react";
import { ClockIcon } from "./Icons";
import { extractBenchmarkFromMemories } from "../utils/benchmarkExtraction";
import { isExactSupplierProductMatch } from "../utils/memoryRelevance";

export default function MemoryTimeline({
  timeline = [],
  supplierName = "TechCore Semiconductors",
  productName = "Microcontroller (MCU)",
  hasMemories = false,
  currentQuote,
  memories = [],
}) {
  const formatName = (str) =>
    !str
      ? ""
      : str
          .split(" ")
          .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
          .join(" ");

  const displaySupplier = formatName(supplierName) || "Supplier";
  const displayProduct = formatName(productName) || "Product";

  const isTechCoreCanonical =
    supplierName?.toLowerCase().includes("techcore") &&
    productName?.toLowerCase().includes("microcontroller");

  // Filter exact supplier + product memories for historical pricing benchmark
  const exactProductMemories = (Array.isArray(memories) ? memories : []).filter((item) => {
    if (isTechCoreCanonical) return true;
    return isExactSupplierProductMatch(item, supplierName, productName);
  });

  const hasProductHistory = isTechCoreCanonical
    ? true
    : Boolean(hasMemories && exactProductMemories.length > 0);

  let activeTimeline = timeline;

  // When there is no historical memory for the CURRENT supplier + product,
  // do not show the TechCore timeline or past product benchmarks. Show clean empty historical state.
  if (!isTechCoreCanonical && !hasProductHistory) {
    const quotedPrice = currentQuote?.price_per_unit || 300;
    const quotedDelivery = currentQuote?.delivery_fee || 0;
    const quantity = currentQuote?.quantity || 10000;
    const unit = currentQuote?.unit || "units";
    const terms = currentQuote?.payment_terms || "Net 30 Days";

    const closedNodes = timeline.filter(
      (item) =>
        item.date === "Closed" &&
        (item.note?.toLowerCase().includes(displayProduct.toLowerCase()) ||
          item.note?.toLowerCase().includes(displaySupplier.toLowerCase()))
    );

    activeTimeline = [
      {
        date: "Past",
        title: "Historical Benchmark",
        tag: "No History",
        price: "No Past Deals",
        delivery: "—",
        note: `No prior negotiation history recorded for ${displaySupplier} on ${displayProduct} in Hindsight bank.`,
      },
      {
        date: "Today",
        title: "Current Quote",
        tag: "Active",
        price: `₹${quotedPrice}/unit`,
        delivery: Number(quotedDelivery) === 0 ? "FREE delivery" : `₹${Number(quotedDelivery).toLocaleString()} delivery`,
        note: `Incoming quote from ${displaySupplier} for ${Number(quantity).toLocaleString()} ${unit} of ${displayProduct} on ${terms} terms.`,
      },
      ...closedNodes,
    ];
  } else if (!isTechCoreCanonical && exactProductMemories.length > 0) {
    // If exact product memories exist, ensure the historical benchmark node uses actual recalled data
    const benchmark = extractBenchmarkFromMemories(exactProductMemories, null, displaySupplier, displayProduct, false);
    if (benchmark.hasHistoricalBenchmark) {
      activeTimeline = activeTimeline.map((item) => {
        const isHistoricalNode =
          item.date === "Past" ||
          item.title === "Historical Benchmark" ||
          item.tag === "No History" ||
          item.tag === "Agreed Benchmark";

        if (isHistoricalNode) {
          const currentPriceIsStale = !item.price || item.price === "No Past Deals" || item.price.includes("178");
          const currentDeliveryIsStale = !item.delivery || item.delivery === "—";
          const currentNoteIsStale =
            !item.note ||
            item.note.toLowerCase().includes("no prior negotiation history") ||
            item.note.toLowerCase().includes("techcore") ||
            item.note.toLowerCase().includes("microcontroller");

          return {
            ...item,
            tag: "Agreed Benchmark",
            price: currentPriceIsStale ? benchmark.successfulPrice : item.price,
            delivery: currentDeliveryIsStale
              ? (benchmark.previousDelivery === "FREE"
                  ? "FREE delivery"
                  : (benchmark.previousDelivery !== "No Concession Recorded"
                      ? `${benchmark.previousDelivery} delivery`
                      : "—"))
              : item.delivery,
            note: currentNoteIsStale ? benchmark.timelineNote : item.note,
          };
        }
        return item;
      });
    }
  }

  return (
    <div className="memory-timeline-section glass-panel">
      <div className="timeline-header-row">
        <div className="timeline-title-group">
          <div className="section-badge-pill">
            <ClockIcon className="badge-icon text-amber" />
            <span>PAST → PRESENT → LEARNING</span>
          </div>
          <h3 className="section-heading">Memory Timeline</h3>
          <p className="section-subtext">
            Evolution of pricing, terms, and supplier concessions across interactions
          </p>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="timeline-track-container">
        <div className="timeline-connecting-line" />

        <div className="timeline-nodes-row">
          {activeTimeline.map((item, idx) => {
            const isToday = item.date.toLowerCase() === "today";
            return (
              <div
                key={idx}
                className={`timeline-step-card ${isToday ? "active-step" : "past-step"}`}
              >
                {/* Node marker on line */}
                <div className="step-marker-wrapper">
                  <div className={`step-marker-dot ${isToday ? "pulse-dot" : ""}`} />
                  <span className="step-date-badge">{item.date}</span>
                </div>

                {/* Card Content */}
                <div className="step-card-box">
                  <div className="step-top-line">
                    <span className="step-title">{item.title}</span>
                    <span className={`step-tag-pill ${item.tag.toLowerCase()}`}>
                      {item.tag}
                    </span>
                  </div>

                  <div className="step-pricing-block">
                    <span className="step-price">{item.price}</span>
                    <span className="step-delivery">{item.delivery}</span>
                  </div>

                  <p className="step-note">{item.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
