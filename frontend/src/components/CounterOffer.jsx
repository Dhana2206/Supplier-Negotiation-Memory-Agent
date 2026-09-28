import React, { useState } from "react";
import { TrendingDownIcon, CheckCircleIcon, CopyIcon } from "./Icons";

export default function CounterOffer({ comparison, hasMemories = true, onUseCounter, onEditCounter }) {
  const [copied, setCopied] = useState(false);

  if (!comparison) return null;

  const isMemoryBacked = comparison.isMemoryBacked !== undefined ? comparison.isMemoryBacked : hasMemories;

  const handleCopy = () => {
    const text = `Counter Offer: ₹${comparison.counterPrice}/unit with ${
      comparison.counterDelivery === 0 ? "Free Delivery" : `₹${comparison.counterDelivery} delivery`
    }${isMemoryBacked ? " based on previous agreed terms." : " based on proposed volume terms."}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="counter-offer-comparison glass-panel">
      <div className="comparison-header">
        <div className={`section-badge-pill ${isMemoryBacked ? "emerald" : "blue"}`}>
          <TrendingDownIcon className={`badge-icon ${isMemoryBacked ? "text-emerald" : "text-blue"}`} />
          <span>{isMemoryBacked ? "PROJECTED VALUE OPTIMIZATION" : "CURRENT QUOTE VALUE OPTIMIZATION"}</span>
        </div>
        <h4 className="comparison-title">Quote vs. Counter Comparison</h4>
      </div>

      <div className="comparison-columns-grid">
        {/* Left: Supplier Quote */}
        <div className="comparison-card quote-incoming">
          <span className="comp-card-type">Incoming Supplier Quote</span>
          <div className="comp-main-price">
            ₹{comparison.quotedPrice}
            <span className="comp-unit">/unit</span>
          </div>
          <div className="comp-detail-line">
            Delivery: <strong>{comparison.quotedDelivery === 0 ? "FREE" : `₹${comparison.quotedDelivery.toLocaleString()}`}</strong>
          </div>
          <span className="comp-status-badge red">Unoptimized</span>
        </div>

        {/* Center: Improvement Delta */}
        <div className="comparison-delta-bridge">
          <div className="delta-circle">
            <span className="delta-label">POTENTIAL GAIN</span>
            <span className="delta-value">₹{comparison.unitSavings}/unit</span>
            <span className="delta-sub">+ freight waiver</span>
          </div>
          <div className="delta-total-savings">
            Potential Savings: <strong className="text-emerald">₹{comparison.totalSavings.toLocaleString()}</strong>
          </div>
        </div>

        {/* Right: Suggested Counter */}
        <div className="comparison-card counter-proposed">
          <span className="comp-card-type">AI Suggested Counter</span>
          <div className="comp-main-price text-emerald">
            ₹{comparison.counterPrice}
            <span className="comp-unit">/unit</span>
          </div>
          <div className="comp-detail-line">
            Delivery:{" "}
            <strong className="text-emerald">
              {comparison.counterDelivery === 0 ? "FREE" : `₹${comparison.counterDelivery}`}
            </strong>
          </div>
          <span className={`comp-status-badge ${isMemoryBacked ? "green" : "blue"}`}>
            {comparison.counterBadge || (isMemoryBacked ? "Memory-Backed" : "Context-Derived")}
          </span>
        </div>
      </div>

      {/* Button Controls */}
      <div className="comparison-actions-row">
        <button
          type="button"
          className="btn-primary btn-accept-counter"
          onClick={onUseCounter}
        >
          <CheckCircleIcon className="btn-icon" />
          <span>Use Counter Offer</span>
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onEditCounter}
        >
          <span>Edit Terms</span>
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={handleCopy}
        >
          <CopyIcon className="btn-icon" />
          <span>{copied ? "Copied Script!" : "Copy Counter Script"}</span>
        </button>
      </div>
    </div>
  );
}
