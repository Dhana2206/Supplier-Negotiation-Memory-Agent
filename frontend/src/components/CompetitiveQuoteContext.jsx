import React, { useState } from "react";
import { ScaleIcon, InfoIcon, TargetIcon } from "./Icons";
import { findComparableBenchmarks } from "../services/quoteComparisonService";

export default function CompetitiveQuoteContext({ currentQuote, memories = [] }) {
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState(null);

  if (!currentQuote || !currentQuote.product) return null;

  const comparison = findComparableBenchmarks({
    currentSupplier: currentQuote.supplier,
    currentProduct: currentQuote.product,
    currentQuantity: currentQuote.quantity,
    currentPrice: currentQuote.price_per_unit,
    currentDelivery: currentQuote.delivery_fee,
    currentPaymentTerms: currentQuote.payment_terms,
    memories,
  });

  const { hasComparable, currentQuote: quoteSummary, comparables, disclaimer, message, subtext } = comparison;

  // Active benchmark selected or first in the list
  const activeBenchmark =
    (selectedBenchmarkId && comparables.find((c) => c.id === selectedBenchmarkId)) ||
    (comparables && comparables.length > 0 ? comparables[0] : null);

  return (
    <div className="competitive-quote-card glass-panel" id="competitive-quote-context">
      {/* Header */}
      <div className="competitive-header-row">
        <div className="competitive-title-group">
          <div className="section-badge-pill indigo">
            <ScaleIcon className="badge-icon text-indigo" />
            <span>CROSS-SUPPLIER BENCHMARK</span>
          </div>
          <h3 className="section-heading">Competitive Quote Context</h3>
          <p className="section-subtext">
            Commercial quote comparison against historical benchmarks and deals recorded for{" "}
            <strong>{currentQuote.product}</strong> across other suppliers.
          </p>
        </div>

        {hasComparable && comparables.length > 1 && (
          <div className="comparable-selector-pills">
            <span className="selector-label">Comparable Supplier:</span>
            <div className="selector-btn-row">
              {comparables.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  className={`benchmark-pill-btn ${activeBenchmark?.id === comp.id ? "active" : ""}`}
                  onClick={() => setSelectedBenchmarkId(comp.id)}
                >
                  <span className="comp-btn-name">{comp.supplier}</span>
                  <span className="comp-btn-price">₹{comp.price_per_unit}/unit</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!hasComparable || !activeBenchmark ? (
        /* Empty / No Comparable Quote State */
        <div className="competitive-empty-panel">
          <div className="empty-panel-icon-wrap">
            <ScaleIcon className="empty-icon" />
          </div>
          <div className="empty-panel-content">
            <h4 className="empty-panel-title">{message || "No comparable supplier quote available."}</h4>
            <p className="empty-panel-desc">
              {subtext ||
                `No other suppliers have recorded quotes or agreements for ${currentQuote.product}. Establish this negotiation as a benchmark.`}
            </p>
            <div className="empty-panel-tip">
              <InfoIcon className="tip-icon" />
              <span>
                Once this negotiation is recorded, it will become the commercial benchmark when evaluating other suppliers for {currentQuote.product}.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Active Comparison Cards */
        <div className="competitive-body-wrap">
          <div className="competitive-cards-grid">
            {/* Card 1: Current Supplier */}
            <div className="competitive-card current-supplier-card">
              <div className="card-scope-badge">
                <span className="scope-dot current" />
                <span>CURRENT SUPPLIER</span>
              </div>
              <h4 className="supplier-card-name">{quoteSummary.supplier || "Current Supplier"}</h4>
              <div className="supplier-pricing-block">
                <div className="card-main-price">
                  ₹{Number(quoteSummary.price_per_unit).toLocaleString()}
                  <span className="unit-label">/unit</span>
                </div>
                <div className="card-delivery-row">
                  <span className="delivery-val">
                    {Number(quoteSummary.delivery_fee) === 0
                      ? "Free delivery"
                      : `₹${Number(quoteSummary.delivery_fee).toLocaleString()} delivery`}
                  </span>
                </div>
              </div>
              <div className="card-meta-footer">
                <span className="meta-item">
                  Volume: {Number(quoteSummary.quantity).toLocaleString()} {currentQuote.unit || "units"}
                </span>
                <span className="meta-sep">•</span>
                <span className="meta-item">{quoteSummary.payment_terms || "Net 30 Days"}</span>
              </div>
              <div className="commercial-total-pill">
                <span className="total-label">Total Commercial Cost:</span>
                <span className="total-val">₹{quoteSummary.totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Card 2: Comparable Supplier / Benchmark */}
            <div className="competitive-card benchmark-supplier-card">
              <div className="card-scope-badge benchmark">
                <span className="scope-dot benchmark" />
                <span>COMPARABLE SUPPLIER / BENCHMARK</span>
              </div>
              <div className="benchmark-title-wrap">
                <h4 className="supplier-card-name">{activeBenchmark.supplier}</h4>
                <span className="historical-benchmark-tag">Historical benchmark</span>
              </div>
              <div className="supplier-pricing-block">
                <div className="card-main-price">
                  ₹{Number(activeBenchmark.price_per_unit).toLocaleString()}
                  <span className="unit-label">/unit</span>
                </div>
                <div className="card-delivery-row">
                  <span className="delivery-val">
                    {Number(activeBenchmark.delivery_fee) === 0
                      ? "Free delivery"
                      : `₹${Number(activeBenchmark.delivery_fee).toLocaleString()} delivery`}
                  </span>
                </div>
              </div>
              <div className="card-meta-footer">
                <span className="meta-item">
                  Baseline: {Number(activeBenchmark.quantity).toLocaleString()} units
                </span>
                <span className="meta-sep">•</span>
                <span className="meta-item">{activeBenchmark.payment_terms || "Net 30 Days"}</span>
              </div>
              <div className="commercial-total-pill benchmark">
                <span className="total-label">Commercial Baseline Cost:</span>
                <span className="total-val">₹{activeBenchmark.totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Card 3: Difference / Commercial Variance */}
            <div className={`competitive-card difference-card ${activeBenchmark.isBenchmarkLower ? "variance-higher" : "variance-lower"}`}>
              <div className="card-scope-badge diff">
                <TargetIcon className="mini-icon" />
                <span>COMMERCIAL VARIANCE</span>
              </div>
              <h4 className="variance-title">Variance vs Benchmark</h4>
              <div className="variance-metrics-block">
                <div className="variance-line">
                  <span className="variance-label">Unit Price:</span>
                  <span className={`variance-value ${activeBenchmark.unitPriceDiff > 0 ? "text-amber" : activeBenchmark.unitPriceDiff < 0 ? "text-emerald" : ""}`}>
                    {activeBenchmark.priceDiffLabel}
                  </span>
                </div>
                <div className="variance-line">
                  <span className="variance-label">Delivery Fee:</span>
                  <span className={`variance-value ${activeBenchmark.deliveryDiff > 0 ? "text-amber" : activeBenchmark.deliveryDiff < 0 ? "text-emerald" : ""}`}>
                    {activeBenchmark.deliveryDiffLabel}
                  </span>
                </div>
                <div className="variance-line total-variance-line">
                  <span className="variance-label">Commercial Variance:</span>
                  <span className={`variance-value-total ${activeBenchmark.totalCommercialDiff > 0 ? "text-amber" : activeBenchmark.totalCommercialDiff < 0 ? "text-emerald" : ""}`}>
                    {activeBenchmark.totalDiffLabel}
                  </span>
                </div>
              </div>
              <div className="variance-summary-tag">
                {activeBenchmark.totalCommercialDiff > 0
                  ? `Active quote is ₹${activeBenchmark.totalCommercialDiff.toLocaleString()} higher total cost`
                  : activeBenchmark.totalCommercialDiff < 0
                  ? `Active quote is ₹${Math.abs(activeBenchmark.totalCommercialDiff).toLocaleString()} lower total cost`
                  : "Commercially equivalent to historical benchmark"}
              </div>
            </div>
          </div>

          {/* Neutral Insight Banner */}
          <div className="competitive-insight-banner">
            <div className="insight-icon-wrap">
              <InfoIcon className="insight-icon" />
            </div>
            <div className="insight-content">
              <span className="insight-tag">STRATEGIC GUIDANCE:</span>
              <p className="insight-text">{activeBenchmark.insight}</p>
            </div>
          </div>

          {/* Market Context & Historical Disclaimer */}
          <div className="competitive-disclaimer-note">
            <span className="disclaimer-bullet">•</span>
            <span>{disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
