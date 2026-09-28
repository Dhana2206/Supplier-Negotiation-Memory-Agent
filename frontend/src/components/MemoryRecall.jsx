import React from "react";
import { DatabaseIcon, CheckCircleIcon, TruckIcon, LayersIcon, SparklesIcon } from "./Icons";
import { extractBenchmarkFromMemories } from "../utils/benchmarkExtraction";
import { isMemoryRelevant, isExactSupplierProductMatch } from "../utils/memoryRelevance";

export default function MemoryRecall({
  history,
  memories = [],
  supplierName = "Supplier",
  productName = "Product",
  isLive = false,
}) {
  const formatName = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
      .join(" ");
  };

  const displaySupplier = formatName(supplierName) || "Supplier";
  const displayProduct = formatName(productName) || "Product";

  const isTechCoreCanonical =
    Boolean(supplierName?.toLowerCase().includes("techcore")) &&
    Boolean(productName?.toLowerCase().includes("microcontroller"));

  // Supplier-level context memories (for live excerpts & behavioral tendencies)
  const relevantMemories = (Array.isArray(memories) ? memories : []).filter((item) => {
    if (isTechCoreCanonical) return true;
    return isMemoryRelevant(item, supplierName, productName);
  });

  // Strict exact supplier + product memories (required for product price/delivery benchmark cards)
  const exactProductMemories = (Array.isArray(memories) ? memories : []).filter((item) => {
    if (isTechCoreCanonical) return true;
    return isExactSupplierProductMatch(item, supplierName, productName);
  });

  // Product benchmark cards require an EXACT supplier + product match
  const hasProductBenchmark = isTechCoreCanonical
    ? true
    : Boolean(exactProductMemories.length > 0);

  const benchmarkData = extractBenchmarkFromMemories(
    hasProductBenchmark ? exactProductMemories : [],
    history,
    displaySupplier,
    displayProduct,
    isTechCoreCanonical
  );

  const hasPrevQuote =
    benchmarkData.previousQuote && !benchmarkData.previousQuote.startsWith("No ");
  const hasSuccessfulPrice =
    benchmarkData.successfulPrice && !benchmarkData.successfulPrice.startsWith("No ");
  const hasDeliveryConcession =
    benchmarkData.previousDelivery && !benchmarkData.previousDelivery.startsWith("No ");
  const hasOrderSize =
    benchmarkData.orderSize && !benchmarkData.orderSize.startsWith("No ");

  return (
    <div id="memory-recall" className="memory-recall-section glass-panel">
      {/* Section Header */}
      <div className="section-header-row">
        <div className="section-title-group">
          <div className={`section-badge-pill ${isLive ? "emerald" : ""}`}>
            <DatabaseIcon className={`badge-icon ${isLive ? "text-emerald" : "text-blue"}`} />
            <span>LIVE HINDSIGHT MEMORY</span>
          </div>
          <h3 className="section-heading">Memory Recall</h3>
          <p className="section-subtext">
            {isLive ? (
              <>Live historical benchmarks recalled from Hindsight for <strong>{displaySupplier}</strong></>
            ) : (
              <>Historical benchmarks recalled for <strong>{displaySupplier}</strong></>
            )}
          </p>
        </div>

        <div className="memory-count-badge">
          <span className="count-dot" />
          <span>
            {hasProductBenchmark
              ? `${exactProductMemories.length} ${isLive ? "memories recalled from live bank" : "relevant memories found"}`
              : (relevantMemories.length > 0
                  ? `${relevantMemories.length} supplier context ${relevantMemories.length === 1 ? "memory" : "memories"} (0 for ${displayProduct})`
                  : `0 relevant memories found`)}
          </span>
        </div>
      </div>

      {/* Visual Memory Benchmark Cards Grid - Dynamically Driven */}
      <div className="memory-cards-grid">
        <div className="memory-stat-card">
          <span className="stat-label">Previous Quote</span>
          <span className={`stat-value ${hasPrevQuote ? "text-gray" : "stat-value-empty"}`}>
            {benchmarkData.previousQuote}
          </span>
          <span className="stat-meta">
            {hasPrevQuote ? "Initial asking rate" : "No historical quote on record"}
          </span>
        </div>

        <div className={`memory-stat-card ${hasSuccessfulPrice ? "highlight-success" : ""}`}>
          {hasSuccessfulPrice && <div className="stat-card-badge">WIN</div>}
          <span className="stat-label">Successful Price</span>
          <span className={`stat-value ${hasSuccessfulPrice ? "text-emerald" : "stat-value-empty"}`}>
            {benchmarkData.successfulPrice}
          </span>
          <span className="stat-meta">
            {hasSuccessfulPrice ? "Achieved via negotiation" : "No prior agreed price"}
          </span>
        </div>

        <div className="memory-stat-card">
          <div className="stat-icon-row">
            <TruckIcon className="stat-icon text-blue" />
            <span className="stat-label">Delivery</span>
          </div>
          <span className={`stat-value ${hasDeliveryConcession ? "text-blue" : "stat-value-empty"}`}>
            {benchmarkData.previousDelivery}
          </span>
          <span className="stat-meta">
            {hasDeliveryConcession ? "Logistics fee absorbed" : "No freight concession recorded"}
          </span>
        </div>

        <div className="memory-stat-card">
          <div className="stat-icon-row">
            <LayersIcon className="stat-icon text-violet" />
            <span className="stat-label">Order Size</span>
          </div>
          <span className={`stat-value ${hasOrderSize ? "text-violet" : "stat-value-empty"}`}>
            {benchmarkData.orderSize}
          </span>
          <span className="stat-meta">
            {hasOrderSize ? "Volume benchmark" : "No historical batch volume"}
          </span>
        </div>
      </div>

      {hasProductBenchmark ? (
        /* Outcome Banner */
        <div className="memory-outcome-banner">
          <div className="banner-icon-cell">
            <CheckCircleIcon className="banner-icon text-emerald" />
          </div>
          <div className="banner-text-cell">
            <span className="banner-lead">Recorded Outcome:</span>
            <span className="banner-body">{benchmarkData.outcomeSummary}</span>
          </div>
        </div>
      ) : (
        /* Clean Empty State when memories.length === 0 or no relevant memories */
        <div className="memory-empty-state-panel">
          <div className="memory-empty-icon-wrap">
            <DatabaseIcon className="memory-empty-icon" />
          </div>
          <div className="memory-empty-text-wrap">
            <h4 className="memory-empty-title">
              No relevant memories found for {displaySupplier} + {displayProduct}.
            </h4>
            <p className="memory-empty-desc">
              {relevantMemories.length > 0
                ? `Hindsight memory bank has supplier-level context for ${displaySupplier}, but no prior negotiations for ${displayProduct}. Complete this negotiation to establish the first product benchmark.`
                : `Hindsight memory bank has no prior records for this supplier and product combination. Complete this negotiation to encode the first benchmark into memory.`}
            </p>
          </div>
        </div>
      )}

      {/* Individual Hindsight Memory Excerpts */}
      <div className="memory-excerpts-wrapper">
        <div className="excerpts-header">
          <SparklesIcon className="mini-icon text-violet" />
          <span>
            {hasProductBenchmark
              ? (isLive ? "Live Excerpts Recalled from Hindsight Bank:" : "Semantic Excerpts from Memory Bank:")
              : (relevantMemories.length > 0
                  ? "Semantic Excerpts from Memory Bank (Supplier Context):"
                  : "Semantic Excerpts from Memory Bank:")}
          </span>
        </div>
        <div className="excerpts-list">
          {exactProductMemories.length > 0 ? (
            exactProductMemories.map((mem, idx) => (
              <div key={idx} className="excerpt-item">
                <span className="excerpt-bullet">●</span>
                <span className="excerpt-text">"{typeof mem === "string" ? mem : mem.text || JSON.stringify(mem)}"</span>
              </div>
            ))
          ) : (
            <div className="excerpt-empty">
              <span>
                No previous memories found in Hindsight bank for {displaySupplier} + {displayProduct}. Complete this negotiation to store the first memory.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
